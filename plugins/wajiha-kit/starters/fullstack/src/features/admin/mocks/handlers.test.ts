import { describe, expect, it } from 'vitest';
import { publicEnv } from '@/shared/env/public-env';
import { PERMS } from '../constants/permissions';
import type { LoginResponse, Page, Supplier } from '../types/api';

const api = (path: string) => `${location.origin}${publicEnv.VITE_ADMIN_API_URL}${path}`;
const auth = { Authorization: 'Bearer mock-token-test', 'Content-Type': 'application/json' };

async function login(username: string): Promise<LoginResponse> {
  const response = await fetch(api('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'anything' }),
  });
  return (await response.json()) as LoginResponse;
}

describe('mock API', () => {
  it('signs in any user; "viewer" gets read-only rights', async () => {
    expect((await login('demo')).roles).toEqual(['admin']);
    const viewer = await login('viewer');
    expect(viewer.roles).toEqual([]);
    expect(viewer.permissions).toEqual([PERMS.supplier.read]);
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
});
