import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { act, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { endpoints } from '@/constants/api';
import { qk } from '@/constants/query-keys';
import { signIn } from '@/test/fixtures/auth';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { createTestQueryClient } from '@/test/render';
import { useCategoryAttributes } from './use-category-attributes';
import { useCreateCategory } from './use-category-mutations';

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('category mutation hooks', () => {
  it('createItemCategory success invalidates categories and lookups', async () => {
    signIn({ permissions: ['item_category:create', 'item_category:update'] });
    server.use(
      http.post(api(endpoints.itemCategories.create), () =>
        HttpResponse.json(
          {
            id: 'cat-new',
            parentId: null,
            code: 'NEW',
            name: 'جديد',
            isActive: true,
          },
          { status: 201 },
        ),
      ),
    );
    const queryClient = createTestQueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: wrapperFor(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ code: 'NEW', name: 'جديد' });
    });

    await waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({ queryKey: qk.categories.all });
    });
  });

  it('useCategoryAttributes stays disabled for a null category id', () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useCategoryAttributes(null), {
      wrapper: wrapperFor(queryClient),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });
});
