import { http } from 'msw';
import { endpoints } from '../api/endpoints';
import { SUPER_ROLE } from '../constants/permissions';
import type { LoginRequest, LoginResponse, Overview, Profile } from '../types/api';
import { db } from './db';
import {
  api,
  denied,
  fail,
  ok,
  permissionsOf,
  readJson,
  tokenFor,
  wait,
  type MockRole,
} from './http';
import { supplierHandlers } from './suppliers';

// The mock API: the same paths and shapes a real backend would serve (../types/api.ts). It also enforces
// what a real backend must: every request needs a valid session (401) and the right permission (403), so
// the UI is tested against an API that says no, not against one that always says yes.
//
// Demo users (any password):
//   anyone else  signs in as administrator
//   viewer       can read suppliers, every change answers 403
//   expired      signs in, then every request answers 401 (the "session ended" path)
//   blocked      the login itself answers 401 (the "wrong password" path)
//
// A resource's list, create, update and delete come from crudHandlers (crud.ts); see suppliers.ts.
// What stays here is what is not a plain list: login, logout, the profile and the overview.

export const handlers = [
  http.post(api(endpoints.auth.login), async ({ request }) => {
    const body = await readJson<LoginRequest>(request);
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    if (username === '' || typeof body.password !== 'string' || body.password === '') {
      return fail(request, 400, {
        ar: 'أدخل اسم المستخدم وكلمة المرور',
        en: 'Enter a user name and a password',
      });
    }
    const name = username.toLowerCase();
    if (name === 'blocked') {
      return fail(request, 401, {
        ar: 'اسم المستخدم أو كلمة المرور غير صحيحة',
        en: 'Wrong user name or password',
      });
    }
    const role: MockRole = name === 'viewer' ? 'viewer' : name === 'expired' ? 'expired' : 'admin';
    db.profile = { ...db.profile, name: username };
    const response: LoginResponse = {
      accessToken: tokenFor(role),
      user: { id: `user-${role}`, username, name: username },
      roles: role === 'viewer' ? [] : [SUPER_ROLE],
      permissions: permissionsOf(role),
    };
    return ok(response);
  }),

  http.post(api(endpoints.auth.logout), async () => {
    await wait();
    return new Response(null, { status: 204 });
  }),

  http.get(api(endpoints.profile), async ({ request }) => {
    const refused = await denied(request);
    if (refused !== undefined) {
      return refused;
    }
    return ok(db.profile);
  }),

  http.put(api(endpoints.profile), async ({ request }) => {
    const refused = await denied(request);
    if (refused !== undefined) {
      return refused;
    }
    const body = await readJson<Profile>(request);
    if (typeof body.name !== 'string' || body.name.trim() === '') {
      return fail(request, 400, { ar: 'الاسم مطلوب', en: 'The name is required' });
    }
    db.profile = {
      name: body.name.trim(),
      email: typeof body.email === 'string' ? body.email.trim() : db.profile.email,
      jobTitle: typeof body.jobTitle === 'string' ? body.jobTitle.trim() : '',
    };
    return ok(db.profile);
  }),

  http.get(api(endpoints.overview), async ({ request }) => {
    const refused = await denied(request);
    if (refused !== undefined) {
      return refused;
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

  ...supplierHandlers,
];
