import { afterEach, describe, expect, it } from 'vitest';
import { waitFor } from '@/test/render';
import { qk } from '../api/query-keys';
import { getAdminQueryClient } from '../lib/query-client';
import { startSession } from '../store/session';
import { prefetchOverview } from './prefetch';

afterEach(() => {
  getAdminQueryClient().clear();
});

describe('overview prefetch', () => {
  it('prefetches the overview numbers under the key the page uses', async () => {
    startSession({
      accessToken: 'mock-token-admin-abc',
      user: { id: 'u1', username: 'demo', name: 'Demo' },
      roles: ['admin'],
      permissions: [],
    });
    prefetchOverview();
    await waitFor(() => {
      expect(getAdminQueryClient().getQueryData(qk.overview)).toMatchObject({
        suppliers: { total: expect.any(Number) },
      });
    });
  });
});
