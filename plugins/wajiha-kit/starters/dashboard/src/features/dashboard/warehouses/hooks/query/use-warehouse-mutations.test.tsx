import { QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { endpoints } from '@/constants/api';
import { qk } from '@/constants/query-keys';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { createTestQueryClient, renderHook, waitFor } from '@/test/render';
import { makeWarehouse } from '../../warehouse-test-utils';
import {
  useCreateWarehouse,
  useDeleteWarehouse,
  useUpdateWarehouse,
} from './use-warehouse-mutations';

const payload = {
  name: 'Main',
  code: 'WH-01',
  isTransit: false,
  isActive: true,
};

function setup() {
  const queryClient = createTestQueryClient();
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper, invalidate };
}

function expectMasterDataInvalidated(invalidate: {
  mock: { calls: unknown[][] };
}) {
  const keys = invalidate.mock.calls.map(
    ([filter]) => (filter as { queryKey: unknown }).queryKey,
  );
  expect(keys).toContainEqual(qk.warehouses.all);
}

describe('warehouse mutations', () => {
  it('create invalidates warehouses', async () => {
    server.use(
      http.post(api(endpoints.warehouses.create), () =>
        HttpResponse.json(makeWarehouse()),
      ),
    );
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useCreateWarehouse(), { wrapper });
    result.current.mutate(payload);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectMasterDataInvalidated(invalidate);
  });

  it('update invalidates warehouses', async () => {
    server.use(
      http.put(api(endpoints.warehouses.update('wh-1')), () =>
        HttpResponse.json(makeWarehouse()),
      ),
    );
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useUpdateWarehouse(), { wrapper });
    result.current.mutate({ id: 'wh-1', payload });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectMasterDataInvalidated(invalidate);
  });

  it('delete invalidates warehouses', async () => {
    server.use(
      http.delete(
        api(endpoints.warehouses.remove('wh-1')),
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useDeleteWarehouse(), { wrapper });
    result.current.mutate('wh-1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectMasterDataInvalidated(invalidate);
  });
});
