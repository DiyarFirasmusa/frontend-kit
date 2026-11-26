import { HttpResponse, delay, type JsonBodyType } from 'msw';
import { type AuditLogResponse } from '@/types/api/audit';
import { type AuditAction, type AuditEntity } from '@/types/api/enums';
import type { FieldErrors, PageResponse } from '@/types/api/page';
/** Shared helpers for the mock backend: URLs, responses, query parsing, audit log writes. */
import { newId } from './seed/base';
import { auditLog } from './seed/misc';
import { ME_USER_ID } from './seed/people';

/**
 * Handlers match the path on any origin (`*` + path). The same handlers then
 * serve the browser worker (any VITE_API_BASE_URL), the unit tests
 * (http://api.test) and the Playwright suite (http://api.e2e.test) without
 * reading the env, which Playwright's Node runtime does not have.
 */
function anyOrigin(path: string): string {
  return `*${path.startsWith('/') ? '' : '/'}${path}`;
}

/** URL pattern for an endpoint on the API. */
export const api = (path: string): string => anyOrigin(path);

/** URL pattern for an endpoint on the auth service (same matching rule). */
export const authApi = (path: string): string => anyOrigin(path);

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

/** A short random delay in the browser so loading states show; none in Node (unit tests, Playwright routes). */
export async function wait(): Promise<void> {
  if (typeof window === 'undefined' || import.meta.env.MODE === 'test') {
    return;
  }
  await delay(150 + Math.floor(Math.random() * 250));
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

/**
 * 422 in the RFC 9457 problem+json shape most OpenAPI backends use: `detail`
 * is the summary the client toasts, `errors` maps each field to its messages
 * (the form puts them under the inputs).
 */
export async function validationProblem(
  request: Request,
  errors: { field: string; ar: string; en: string }[],
): Promise<Response> {
  await wait();
  const english = isEnglish(request);
  const fieldErrors: FieldErrors = {};
  for (const error of errors) {
    fieldErrors[error.field] = [english ? error.en : error.ar];
  }
  return HttpResponse.json(
    {
      type: 'about:blank',
      title: english ? 'Validation failed' : 'فشل التحقق',
      status: 422,
      detail: english
        ? 'Some fields need attention'
        : 'بعض الحقول تحتاج إلى تصحيح',
      errors: fieldErrors,
    },
    { status: 422, headers: { 'Content-Type': 'application/problem+json' } },
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

/** The page of a list in the Spring Data shape (`page` is 0-based). */
export function paginate<T>(
  rows: T[],
  page: number,
  size: number,
): PageResponse<T> & { page: number } {
  const safeSize = Math.min(1000, Math.max(1, size));
  const safePage = Math.max(0, page);
  return {
    content: rows.slice(safePage * safeSize, safePage * safeSize + safeSize),
    page: safePage,
    number: safePage,
    size: safeSize,
    totalElements: rows.length,
    totalPages: Math.ceil(rows.length / safeSize),
  };
}

/**
 * Applies `sort=<field>,<asc|desc>` when the field is one the endpoint allows
 * (an unknown field is ignored, as most backends do).
 */
export function sortBy<T>(
  rows: T[],
  url: URL,
  allowed: Record<string, (row: T) => string | number | null>,
): T[] {
  const [field = '', direction = 'asc'] = (
    url.searchParams.get('sort') ?? ''
  ).split(',');
  const read = allowed[field];
  if (!read) {
    return rows;
  }
  const collator = new Intl.Collator('ar', { numeric: true });
  const sign = direction === 'desc' ? -1 : 1;
  return rows.toSorted((a, b) => {
    const left = read(a);
    const right = read(b);
    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * sign;
    }
    return collator.compare(String(left ?? ''), String(right ?? '')) * sign;
  });
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
