import { describe, expect, it } from 'vitest';
import { publicEnv } from '@/shared/env/public-env';
import { ALL_PERMISSIONS, PERMS } from '../constants/permissions';
import type { LoginResponse, Page, Supplier } from '../types/api';

const api = (path: string) => `${location.origin}${publicEnv.VITE_ADMIN_API_URL}${path}`;
const auth = { Authorization: 'Bearer mock-token-admin-test', 'Content-Type': 'application/json' };

async function login(username: string): Promise<LoginResponse> {
  const response = await fetch(api('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'anything' }),
  });
  return (await response.json()) as LoginResponse;
}

const tokenFor = async (username: string): Promise<Record<string, string>> => ({
  Authorization: `Bearer ${(await login(username)).accessToken}`,
  'Content-Type': 'application/json',
});

describe('mock API', () => {
  it('signs in any user; "viewer" gets read-only rights', async () => {
    expect((await login('demo')).roles).toEqual(['admin']);
    const viewer = await login('viewer');
    expect(viewer.roles).toEqual([]);
    // Every read permission and nothing else, so a resource added later does not break this test.
    expect(viewer.permissions).toContain(PERMS.supplier.read);
    expect(viewer.permissions).toEqual(ALL_PERMISSIONS.filter((item) => item.endsWith(':read')));
    expect(viewer.permissions).not.toContain(PERMS.supplier.write);
  });

  it('refuses data without a session', async () => {
    expect((await fetch(api('/suppliers'))).status).toBe(401);
  });

  it('pages, searches and filters suppliers', async () => {
    const page2 = (await (
      await fetch(api('/suppliers?page=2&pageSize=10'), { headers: auth })
    ).json()) as Page<Supplier>;
    expect(page2).toMatchObject({ page: 2, pageSize: 10, total: 23 });
    expect(page2.items).toHaveLength(10);

    const inactive = (await (
      await fetch(api('/suppliers?status=inactive'), { headers: auth })
    ).json()) as Page<Supplier>;
    expect(inactive.items.every((row) => !row.isActive)).toBe(true);

    const found = (await (
      await fetch(api('/suppliers?q=sup-007'), { headers: auth })
    ).json()) as Page<Supplier>;
    expect(found.items.map((row) => row.code)).toEqual(['SUP-007']);
  });

  it('creates, refuses a taken code, updates and deletes', async () => {
    const body = { code: 'NEW-1', name: 'Test Supplier', isActive: true };
    const created = await fetch(api('/suppliers'), {
      method: 'POST',
      headers: auth,
      body: JSON.stringify(body),
    });
    expect(created.status).toBe(201);
    const row = (await created.json()) as Supplier;

    const duplicate = await fetch(api('/suppliers'), {
      method: 'POST',
      headers: { ...auth, 'Accept-Language': 'en' },
      body: JSON.stringify(body),
    });
    expect(duplicate.status).toBe(409);
    expect(await duplicate.json()).toEqual({ message: 'This supplier code is already used' });

    const updated = await fetch(api(`/suppliers/${row.id}`), {
      method: 'PUT',
      headers: auth,
      body: JSON.stringify({ ...body, name: 'Renamed' }),
    });
    expect(((await updated.json()) as Supplier).name).toBe('Renamed');

    const removed = await fetch(api(`/suppliers/${row.id}`), { method: 'DELETE', headers: auth });
    expect(removed.status).toBe(204);
  });

  describe('permissions are enforced by the API, not only hidden in the UI', () => {
    const body = JSON.stringify({ code: 'NEW-9', name: 'Nope', isActive: true });

    it('lets a read-only user read and answers 403 to every change', async () => {
      const viewer = await tokenFor('viewer');
      expect((await fetch(api('/suppliers'), { headers: viewer })).status).toBe(200);
      expect((await fetch(api('/overview'), { headers: viewer })).status).toBe(200);
      const create = await fetch(api('/suppliers'), { method: 'POST', headers: viewer, body });
      expect(create.status).toBe(403);
      expect(
        (await fetch(api('/suppliers/sup-001'), { method: 'PUT', headers: viewer, body })).status,
      ).toBe(403);
      expect(
        (await fetch(api('/suppliers/sup-001'), { method: 'DELETE', headers: viewer })).status,
      ).toBe(403);
      // Nothing changed.
      const page = (await (
        await fetch(api('/suppliers'), { headers: viewer })
      ).json()) as Page<Supplier>;
      expect(page.total).toBe(23);
    });

    it('answers in the request language', async () => {
      const viewer = { ...(await tokenFor('viewer')), 'Accept-Language': 'en' };
      const response = await fetch(api('/suppliers'), { method: 'POST', headers: viewer, body });
      expect(await response.json()).toEqual({ message: 'Your account is not allowed to do this' });
    });

    it('lets an administrator change data', async () => {
      const admin = await tokenFor('demo');
      expect(
        (await fetch(api('/suppliers'), { method: 'POST', headers: admin, body })).status,
      ).toBe(201);
    });

    it('answers 401 to the "expired" user on every protected endpoint, after a normal login', async () => {
      const expired = await tokenFor('expired');
      for (const path of ['/suppliers', '/overview', '/profile']) {
        expect((await fetch(api(path), { headers: expired })).status, path).toBe(401);
      }
    });

    it('refuses the "blocked" user at the login itself', async () => {
      const response = await fetch(api('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'blocked', password: 'x' }),
      });
      expect(response.status).toBe(401);
    });

    it('does not accept a token it did not issue', async () => {
      const forged = {
        Authorization: 'Bearer mock-token-superuser-1',
        'Content-Type': 'application/json',
      };
      expect((await fetch(api('/suppliers'), { headers: forged })).status).toBe(401);
    });
  });

  it('answers a page past the end with no rows and the real total, like a real backend', async () => {
    const page = (await (
      await fetch(api('/suppliers?page=9&pageSize=10'), { headers: auth })
    ).json()) as Page<Supplier>;
    expect(page).toMatchObject({ page: 9, total: 23, items: [] });
  });
});
