import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { qk } from '@/constants/query-keys';
import { deferred } from '@/test/deferred';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { createTestQueryClient, renderHook, waitFor } from '@/test/render';
import {
  useAddWarehouseMember,
  useChangeWarehouseMemberRole,
  useRemoveWarehouseMember,
  useWarehouseMembers,
} from './use-warehouse-members';

const WAREHOUSE = 'wh-1';
const USER = '6f1d2c3a-0000-4000-8000-000000000001';

/** The members query, a watched warehouses list, and the three mutations. */
function setup() {
  const queryClient = createTestQueryClient();
  const counts = { members: 0, lists: 0 };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const view = renderHook(
    () => {
      useQuery({
        queryKey: qk.warehouses.list({}),
        queryFn: () => {
          counts.lists += 1;
          return [];
        },
      });
      return {
        members: useWarehouseMembers(WAREHOUSE),
        add: useAddWarehouseMember(WAREHOUSE),
        changeRole: useChangeWarehouseMemberRole(WAREHOUSE),
        remove: useRemoveWarehouseMember(WAREHOUSE),
      };
    },
    { wrapper },
  );
  return { view, counts };
}

/** Members answer a gate after the first load, so a refetch can be held open. */
function serveMembers(counts: { members: number }, gate: Promise<void>) {
  server.use(
    http.get(api(endpoints.warehouses.users(WAREHOUSE)), async () => {
      counts.members += 1;
      if (counts.members > 1) {
        await gate;
      }
      return HttpResponse.json([]);
    }),
    http.post(api(endpoints.warehouses.users(WAREHOUSE)), () =>
      HttpResponse.json({ userId: USER, role: 'STOREKEEPER' }),
    ),
    http.put(api(endpoints.warehouses.changeUserRole(WAREHOUSE, USER)), () =>
      HttpResponse.json({ userId: USER, role: 'STOCK_CONTROLLER' }),
    ),
    http.delete(
      api(endpoints.warehouses.removeUser(WAREHOUSE, USER)),
      () => new HttpResponse(null, { status: 204 }),
    ),
  );
}

describe('warehouse member mutations', () => {
  it('adding stays pending until members refetch, and refreshes the list count', async () => {
    const gate = deferred();
    const { view, counts } = setup();
    serveMembers(counts, gate.promise);
    await waitFor(() =>
      expect(view.result.current.members.isSuccess).toBe(true),
    );
    await waitFor(() => expect(counts.lists).toBe(1));

    view.result.current.add.mutate({ userId: USER, role: 'STOREKEEPER' });

    await waitFor(() => expect(counts.members).toBe(2));
    expect(view.result.current.add.isPending).toBe(true);
    gate.resolve();
    await waitFor(() => expect(view.result.current.add.isSuccess).toBe(true));
    expect(counts.lists).toBe(2);
  });

  it('removing stays pending until members refetch, and refreshes the list count', async () => {
    const gate = deferred();
    const { view, counts } = setup();
    serveMembers(counts, gate.promise);
    await waitFor(() =>
      expect(view.result.current.members.isSuccess).toBe(true),
    );
    await waitFor(() => expect(counts.lists).toBe(1));

    view.result.current.remove.mutate(USER);

    await waitFor(() => expect(counts.members).toBe(2));
    expect(view.result.current.remove.isPending).toBe(true);
    gate.resolve();
    await waitFor(() =>
      expect(view.result.current.remove.isSuccess).toBe(true),
    );
    expect(counts.lists).toBe(2);
  });

  it('changing a role stays pending until members refetch and leaves the list alone', async () => {
    const gate = deferred();
    const { view, counts } = setup();
    serveMembers(counts, gate.promise);
    await waitFor(() =>
      expect(view.result.current.members.isSuccess).toBe(true),
    );
    await waitFor(() => expect(counts.lists).toBe(1));

    view.result.current.changeRole.mutate({
      userId: USER,
      role: 'STOCK_CONTROLLER',
    });

    await waitFor(() => expect(counts.members).toBe(2));
    expect(view.result.current.changeRole.isPending).toBe(true);
    gate.resolve();
    await waitFor(() =>
      expect(view.result.current.changeRole.isSuccess).toBe(true),
    );
    expect(counts.lists).toBe(1);
  });
});
