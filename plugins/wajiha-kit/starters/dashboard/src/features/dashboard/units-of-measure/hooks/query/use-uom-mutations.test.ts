import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { endpoints } from '@/constants/api';
import { qk } from '@/constants/query-keys';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { act, createTestQueryClient, renderHook, waitFor } from '@/test/render';
import { makeUnitOfMeasure } from '../../uom-test-utils';
import {
  useCreateUnitOfMeasure,
  useDeleteUnitOfMeasure,
  useUpdateUnitOfMeasure,
} from './use-uom-mutations';

function setup() {
  const queryClient: QueryClient = createTestQueryClient();
  const spy = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  return { spy, wrapper };
}

const payload = { code: 'BOX', name: 'Box', decimalPlaces: 0, isActive: true };

function expectInvalidated(spy: ReturnType<typeof setup>['spy']) {
  expect(spy).toHaveBeenCalledWith({ queryKey: qk.unitsOfMeasure.all });
}

describe('unit of measure mutation hooks', () => {
  it('invalidates unitsOfMeasure after create', async () => {
    server.use(
      http.post(api(endpoints.unitsOfMeasure.create), () =>
        HttpResponse.json(makeUnitOfMeasure(), { status: 201 }),
      ),
    );
    const { spy, wrapper } = setup();
    const { result } = renderHook(() => useCreateUnitOfMeasure(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync(payload);
    });
    await waitFor(() => expectInvalidated(spy));
  });

  it('invalidates unitsOfMeasure after update', async () => {
    server.use(
      http.put(api(endpoints.unitsOfMeasure.update('uom-1')), () =>
        HttpResponse.json(makeUnitOfMeasure()),
      ),
    );
    const { spy, wrapper } = setup();
    const { result } = renderHook(() => useUpdateUnitOfMeasure(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ id: 'uom-1', payload });
    });
    await waitFor(() => expectInvalidated(spy));
  });

  it('invalidates unitsOfMeasure after delete', async () => {
    server.use(
      http.delete(
        api(endpoints.unitsOfMeasure.remove('uom-1')),
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    const { spy, wrapper } = setup();
    const { result } = renderHook(() => useDeleteUnitOfMeasure(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync('uom-1');
    });
    await waitFor(() => expectInvalidated(spy));
  });
});
