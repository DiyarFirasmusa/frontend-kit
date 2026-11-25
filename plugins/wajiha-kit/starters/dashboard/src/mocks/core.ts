import { HttpResponse, delay, type JsonBodyType } from 'msw';
import { type AuditLogResponse } from '@/types/api/audit';
import { type AuditAction, type AuditEntity } from '@/types/api/enums';
/** Shared helpers for the mock backend: URLs, responses, query parsing, audit log writes. */
import { newId } from './seed/base';
import { auditLog } from './seed/misc';
import { ME_USER_ID } from './seed/people';

export function trimBase(value: string | undefined): string {
  return (value ?? '').trim().replace(/\/+$/, '');
}

export const API_BASE = trimBase(import.meta.env.VITE_API_BASE_URL);
export const AUTH_BASE =
  trimBase(import.meta.env.VITE_AUTH_BASE_URL) || API_BASE;

export function join(base: string, path: string): string {
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Absolute URL on the inventory API (axios joins baseURL + url the same way). */
export const api = (path: string): string => join(API_BASE, path);

/** Absolute URL on the auth service (requests sent with `authBase: true`). */
export const authApi = (path: string): string => join(AUTH_BASE, path);

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

export function wait(): Promise<void> {
  return delay(150 + Math.floor(Math.random() * 250));
}

export async function ok(body: JsonBodyType, status = 200): Promise<Response> {
  await wait();
  return HttpResponse.json(body, { status });
}

export async function noContent(): Promise<Response> {
  await wait();
  return new HttpResponse(null, { status: 204 });
}

export function isEnglish(request: Request): boolean {
  return (request.headers.get('Accept-Language') ?? 'ar')
    .toLowerCase()
    .startsWith('en');
}

/** Error body the app's error parser reads (`message`), in the UI language. */
export async function fail(
  request: Request,
  status: number,
  ar: string,
  en: string,
): Promise<Response> {
  await wait();
  return HttpResponse.json(
    { message: isEnglish(request) ? en : ar },
    { status },
  );
}

export const notFound = (request: Request): Promise<Response> =>
  fail(request, 404, 'السجل غير موجود', 'Record not found');

export function param(
  params: Record<string, string | readonly string[] | undefined>,
  name: string,
): string {
  const value = params[name];
  return typeof value === 'string' ? value : '';
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export function boolParam(url: URL, name: string): boolean | undefined {
  const value = url.searchParams.get(name);
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return undefined;
}

export function intParam(url: URL, name: string, fallback: number): number {
  const raw = url.searchParams.get(name);
  const value = raw === null ? Number.NaN : Math.trunc(Number(raw));
  return Number.isFinite(value) ? value : fallback;
}

export function textParam(url: URL, name: string): string {
  return (url.searchParams.get(name) ?? '').trim();
}

/** Lower-case and fold common Arabic letter variants so search is forgiving. */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(/[أإآ]/g, 'ا')
    .replaceAll('ة', 'ه')
    .replaceAll('ى', 'ي')
    .replaceAll(/[ً-ْ]/g, '');
}

export function matches(
  q: string,
  ...fields: (string | null | undefined)[]
): boolean {
  if (q === '') {
    return true;
  }
  const needle = normalize(q);
  return fields.some(
    (field) =>
      field !== null &&
      field !== undefined &&
      normalize(field).includes(needle),
  );
}

export function sameCode(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  return (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();
}

export function paginate<T>(rows: T[], page: number, size: number) {
  const safeSize = Math.max(1, size);
  return {
    content: rows.slice(page * safeSize, page * safeSize + safeSize),
    page,
    size: safeSize,
    totalElements: rows.length,
    totalPages: Math.ceil(rows.length / safeSize),
  };
}

export const nowIso = (): string => new Date().toISOString();

export function audit(
  entity: AuditEntity,
  entityId: string,
  action: AuditAction,
  changes: { field: string; oldValue: unknown; newValue: unknown }[],
  parent: { entity: string; id: string } | null = null,
): void {
  const entry: AuditLogResponse = {
    id: newId(),
    entity,
    entityId,
    parentEntity: parent?.entity ?? null,
    parentId: parent?.id ?? null,
    action,
    changedBy: ME_USER_ID,
    changedAt: nowIso(),
    changes,
  };
  auditLog.push(entry);
}

export function diff<T extends object>(
  before: T,
  after: T,
  fields: (keyof T & string)[],
) {
  return fields
    .filter((field) => before[field] !== after[field])
    .map((field) => ({
      field,
      oldValue: before[field],
      newValue: after[field],
    }));
}

// ---------------------------------------------------------------------------
// Warehouses
// ---------------------------------------------------------------------------

export function nextCode(prefix: string, existing: (string | null)[]): string {
  let n = existing.length + 1;
  const taken = new Set(existing.map((c) => (c ?? '').toLowerCase()));
  while (taken.has(`${prefix}-${String(n).padStart(3, '0')}`.toLowerCase())) {
    n += 1;
  }
  return `${prefix}-${String(n).padStart(3, '0')}`;
}
