import { delay, HttpResponse, type JsonBodyType } from 'msw';
import { publicEnv } from '@/shared/env/public-env';
import { ALL_PERMISSIONS, type Permission } from '../constants/permissions';
import { isGranted } from '../store/permission-store';

// What every mock handler needs: the API address, answers in the request's language, and the checks a
// backend makes first (a valid session is 401, a missing permission is 403).

/** The full URL a handler listens on: the API base plus an endpoint path. */
export const api = (path: string): string => `${publicEnv.VITE_ADMIN_API_URL}${path}`;

/** A short wait so loading states are visible in the browser; none in unit tests. */
export async function wait(): Promise<void> {
  if (import.meta.env.MODE !== 'test') {
    await delay(150 + Math.floor(Math.random() * 200));
  }
}

export async function ok(body: JsonBodyType, status = 200): Promise<Response> {
  await wait();
  return HttpResponse.json(body, { status });
}

/** A message in both languages; the answer uses the request's (Accept-Language). */
export type Message = { ar: string; en: string };

function english(request: Request): boolean {
  return (request.headers.get('Accept-Language') ?? 'ar').toLowerCase().startsWith('en');
}

/** An error body with a `message` in the request's language (the admin shows it as is). */
export async function fail(request: Request, status: number, message: Message): Promise<Response> {
  await wait();
  return HttpResponse.json({ message: english(request) ? message.en : message.ar }, { status });
}

/** The token carries the demo user's role, so the mock can tell users apart: mock-token-<role>-<random>. */
export type MockRole = 'admin' | 'viewer' | 'expired';
const TOKEN_PREFIX = 'mock-token-';

export function tokenFor(role: MockRole): string {
  return `${TOKEN_PREFIX}${role}-${crypto.randomUUID()}`;
}

function roleOf(request: Request): MockRole | undefined {
  const header = request.headers.get('Authorization') ?? '';
  if (!header.startsWith(`Bearer ${TOKEN_PREFIX}`)) {
    return undefined;
  }
  const role = header.slice(`Bearer ${TOKEN_PREFIX}`.length).split('-')[0];
  return role === 'admin' || role === 'viewer' || role === 'expired' ? role : undefined;
}

/**
 * What each demo role may do: the administrator holds everything ("expired" is an administrator whose
 * session the server no longer accepts), the viewer holds every read permission and nothing else, so a new
 * resource is readable by the viewer without touching this file.
 */
export function permissionsOf(role: MockRole): Permission[] {
  return role === 'viewer'
    ? ALL_PERMISSIONS.filter((permission) => permission.endsWith(':read'))
    : [...ALL_PERMISSIONS];
}

const SESSION_ENDED: Message = {
  ar: 'انتهت الجلسة، سجّل الدخول من جديد',
  en: 'Your session ended. Please sign in again.',
};
const NOT_ALLOWED: Message = {
  ar: 'حسابك لا يملك صلاحية هذا الإجراء',
  en: 'Your account is not allowed to do this',
};

/**
 * The check every protected endpoint starts with: no valid session is 401, a missing permission is 403.
 * Returns the error response to send, or undefined when the request may go on.
 *
 *   const refused = await denied(request, PERMS.supplier.write);
 *   if (refused !== undefined) { return refused; }
 */
export async function denied(
  request: Request,
  permission?: Permission,
): Promise<Response | undefined> {
  const role = roleOf(request);
  if (role === undefined || role === 'expired') {
    return fail(request, 401, SESSION_ENDED);
  }
  if (permission !== undefined && !isGranted({ permissions: permissionsOf(role) }, permission)) {
    return fail(request, 403, NOT_ALLOWED);
  }
  return undefined;
}

export async function readJson<T>(request: Request): Promise<Partial<T>> {
  try {
    const body: unknown = await request.json();
    return typeof body === 'object' && body !== null ? (body as Partial<T>) : {};
  } catch {
    return {};
  }
}

export const normalize = (value: string): string => value.trim().toLocaleLowerCase();

/** Optional text: trimmed, and dropped when empty. */
export const optional = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : null;

/** True for a string with something in it. */
export const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';
