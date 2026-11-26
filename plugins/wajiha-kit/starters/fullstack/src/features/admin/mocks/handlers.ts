import { delay, http, HttpResponse, type JsonBodyType } from 'msw';
import { publicEnv } from '@/shared/env/public-env';
import { endpoints } from '../api/endpoints';
import { ALL_PERMISSIONS, PERMS, SUPER_ROLE } from '../constants/permissions';
import type {
  LoginRequest,
  LoginResponse,
  Overview,
  Page,
  Profile,
  Supplier,
  SupplierRequest,
} from '../types/api';
import { db } from './db';

// The mock API: the same paths and shapes a real backend would serve (../types/api.ts). Any user name
// and password sign in; the user name "viewer" gets read-only rights, so the permission checks can be seen.

const api = (path: string): string => `${publicEnv.VITE_ADMIN_API_URL}${path}`;

/** A short wait so loading states are visible in the browser; none in unit tests. */
async function wait(): Promise<void> {
  if (import.meta.env.MODE !== 'test') {
    await delay(150 + Math.floor(Math.random() * 200));
  }
}

async function ok(body: JsonBodyType, status = 200): Promise<Response> {
  await wait();
  return HttpResponse.json(body, { status });
}

function english(request: Request): boolean {
  return (request.headers.get('Accept-Language') ?? 'ar').toLowerCase().startsWith('en');
}

/** An error body with a `message` in the request's language (the admin shows it as is). */
async function fail(request: Request, status: number, ar: string, en: string): Promise<Response> {
  await wait();
  return HttpResponse.json({ message: english(request) ? en : ar }, { status });
}

function signedIn(request: Request): boolean {
  return (request.headers.get('Authorization') ?? '').startsWith('Bearer mock-token-');
}

const unauthorized = (request: Request) =>
  fail(
    request,
    401,
    'انتهت الجلسة، سجّل الدخول من جديد',
    'Your session ended. Please sign in again.',
  );

async function readJson<T>(request: Request): Promise<Partial<T>> {
  try {
    const body: unknown = await request.json();
    return typeof body === 'object' && body !== null ? (body as Partial<T>) : {};
  } catch {
    return {};
  }
}

const normalize = (value: string): string => value.trim().toLocaleLowerCase();

function matches(row: Supplier, query: string): boolean {
  if (query === '') {
    return true;
  }
  return [row.code, row.name, row.contactName, row.phone, row.email].some(
    (value) => value !== null && normalize(value).includes(query),
  );
}

function intParam(url: URL, name: string, fallback: number, max: number): number {
  const value = Number(url.searchParams.get(name));
  return Number.isInteger(value) && value >= 1 ? Math.min(value, max) : fallback;
}

/** Optional text: trimmed, and dropped when empty. */
const optional = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : null;

function codeTaken(code: string, exceptId?: string): boolean {
  return db.suppliers.some((row) => row.id !== exceptId && normalize(row.code) === normalize(code));
}

function invalidSupplier(body: Partial<SupplierRequest>): boolean {
  return (
    typeof body.code !== 'string' ||
    body.code.trim() === '' ||
    typeof body.name !== 'string' ||
    body.name.trim() === ''
  );
}

export const handlers = [
  http.post(api(endpoints.auth.login), async ({ request }) => {
    const body = await readJson<LoginRequest>(request);
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    if (username === '' || typeof body.password !== 'string' || body.password === '') {
      return fail(
        request,
        400,
        'أدخل اسم المستخدم وكلمة المرور',
        'Enter a user name and a password',
      );
    }
    const viewer = username.toLowerCase() === 'viewer';
    db.profile = { ...db.profile, name: username };
    const response: LoginResponse = {
      accessToken: `mock-token-${crypto.randomUUID()}`,
      user: { id: viewer ? 'user-viewer' : 'user-admin', username, name: username },
      roles: viewer ? [] : [SUPER_ROLE],
      permissions: viewer ? [PERMS.supplier.read] : [...ALL_PERMISSIONS],
    };
    return ok(response);
  }),

  http.post(api(endpoints.auth.logout), async () => {
    await wait();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(api(endpoints.profile), async ({ request }) => {
    if (!signedIn(request)) {
      return unauthorized(request);
    }
    return ok(db.profile);
  }),

  http.put(api(endpoints.profile), async ({ request }) => {
    if (!signedIn(request)) {
      return unauthorized(request);
    }
    const body = await readJson<Profile>(request);
    if (typeof body.name !== 'string' || body.name.trim() === '') {
      return fail(request, 400, 'الاسم مطلوب', 'The name is required');
    }
    db.profile = {
      name: body.name.trim(),
      email: typeof body.email === 'string' ? body.email.trim() : db.profile.email,
      jobTitle: typeof body.jobTitle === 'string' ? body.jobTitle.trim() : '',
    };
    return ok(db.profile);
  }),

  http.get(api(endpoints.overview), async ({ request }) => {
    if (!signedIn(request)) {
      return unauthorized(request);
    }
    const active = db.suppliers.filter((row) => row.isActive).length;
    const response: Overview = {
      suppliers: {
        total: db.suppliers.length,
        active,
        inactive: db.suppliers.length - active,
      },
      recentlyUpdated: db.suppliers
        .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5),
    };
    return ok(response);
  }),

  http.get(api(endpoints.suppliers.list), async ({ request }) => {
    if (!signedIn(request)) {
      return unauthorized(request);
    }
    const url = new URL(request.url);
    const query = normalize(url.searchParams.get('q') ?? '');
    const status = url.searchParams.get('status');
    const pageSize = intParam(url, 'pageSize', 10, 100);
    const rows = db.suppliers
      .filter((row) => matches(row, query))
      .filter((row) =>
        status === 'active' ? row.isActive : status === 'inactive' ? !row.isActive : true,
      )
      .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const lastPage = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(intParam(url, 'page', 1, Number.MAX_SAFE_INTEGER), lastPage);
    const response: Page<Supplier> = {
      items: rows.slice((page - 1) * pageSize, page * pageSize),
      total: rows.length,
      page,
      pageSize,
    };
    return ok(response);
  }),

  http.post(api(endpoints.suppliers.create), async ({ request }) => {
    if (!signedIn(request)) {
      return unauthorized(request);
    }
    const body = await readJson<SupplierRequest>(request);
    if (invalidSupplier(body)) {
      return fail(request, 400, 'الرمز والاسم مطلوبان', 'Code and name are required');
    }
    if (codeTaken(body.code ?? '')) {
      return fail(request, 409, 'رمز المورد مستخدم مسبقاً', 'This supplier code is already used');
    }
    db.nextId += 1;
    const supplier: Supplier = {
      id: `sup-${db.nextId}`,
      code: (body.code ?? '').trim(),
      name: (body.name ?? '').trim(),
      contactName: optional(body.contactName),
      phone: optional(body.phone),
      email: optional(body.email),
      notes: optional(body.notes),
      isActive: body.isActive !== false,
      updatedAt: new Date().toISOString(),
    };
    db.suppliers.push(supplier);
    return ok(supplier, 201);
  }),

  http.put(api(endpoints.suppliers.update(':id')), async ({ params, request }) => {
    if (!signedIn(request)) {
      return unauthorized(request);
    }
    const supplier = db.suppliers.find((row) => row.id === params['id']);
    if (supplier === undefined) {
      return fail(request, 404, 'المورد غير موجود', 'Supplier not found');
    }
    const body = await readJson<SupplierRequest>(request);
    if (invalidSupplier(body)) {
      return fail(request, 400, 'الرمز والاسم مطلوبان', 'Code and name are required');
    }
    if (codeTaken(body.code ?? '', supplier.id)) {
      return fail(request, 409, 'رمز المورد مستخدم مسبقاً', 'This supplier code is already used');
    }
    Object.assign(supplier, {
      code: (body.code ?? '').trim(),
      name: (body.name ?? '').trim(),
      contactName: optional(body.contactName),
      phone: optional(body.phone),
      email: optional(body.email),
      notes: optional(body.notes),
      isActive: body.isActive !== false,
      updatedAt: new Date().toISOString(),
    } satisfies Omit<Supplier, 'id'>);
    return ok(supplier);
  }),

  http.delete(api(endpoints.suppliers.remove(':id')), async ({ params, request }) => {
    if (!signedIn(request)) {
      return unauthorized(request);
    }
    const index = db.suppliers.findIndex((row) => row.id === params['id']);
    if (index === -1) {
      return fail(request, 404, 'المورد غير موجود', 'Supplier not found');
    }
    db.suppliers.splice(index, 1);
    await wait();
    return new HttpResponse(null, { status: 204 });
  }),
];
