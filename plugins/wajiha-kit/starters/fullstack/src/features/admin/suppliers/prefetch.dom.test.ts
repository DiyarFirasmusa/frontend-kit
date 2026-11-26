import { afterEach, describe, expect, it } from 'vitest';
import { useToastStore } from '@/shared/store/toast-store';
import { waitFor } from '@/test/render';
import { qk } from '../api/query-keys';
import { getAdminQueryClient } from '../lib/query-client';
import { startSession } from '../store/session';
import { prefetchOverview, prefetchSuppliers } from './prefetch';
import { suppliersListParams } from './supplier-search';

function signIn(): void {
  startSession({
    accessToken: 'mock-token-admin-abc',
    user: { id: 'u1', username: 'demo', name: 'Demo' },
    roles: ['admin'],
    permissions: [],
  });
}

afterEach(() => {
  getAdminQueryClient().clear();
});

describe('the admin QueryClient', () => {
  it('is one client for the whole visit', () => {
    expect(getAdminQueryClient()).toBe(getAdminQueryClient());
  });
});

describe('route prefetch', () => {
  it('puts the list a page will ask for in the cache, under the key the page uses', async () => {
    signIn();
    prefetchSuppliers({ page: 2, status: 'active' });
    const key = qk.suppliers.list(suppliersListParams({ page: 2, status: 'active' }));
    await waitFor(() => {
      expect(getAdminQueryClient().getQueryData(key)).toMatchObject({ page: 2 });
    });
  });

  it('turns a list state into the same request the page makes (page 1 when the URL has none)', () => {
    expect(suppliersListParams({})).toEqual({
      q: undefined,
      status: undefined,
      page: 1,
      pageSize: 10,
    });
    expect(suppliersListParams({ q: 'abc', page: 3 })).toMatchObject({ q: 'abc', page: 3 });
  });

  it('prefetches the overview numbers', async () => {
    signIn();
    prefetchOverview();
    await waitFor(() => {
      expect(getAdminQueryClient().getQueryData(qk.overview)).toMatchObject({
        suppliers: { total: expect.any(Number) },
      });
    });
  });

  it('fails silently: no error toast and nothing thrown (the page asks again and shows the error)', async () => {
    // Signed out: the mock answers 401, which a prefetch must swallow.
    prefetchSuppliers({});
    await waitFor(() => {
      expect(
        getAdminQueryClient().getQueryState(qk.suppliers.list(suppliersListParams({}))),
      ).toMatchObject({
        status: 'error',
      });
    });
    expect(useToastStore.getState().toasts).toEqual([]);
  });
});
