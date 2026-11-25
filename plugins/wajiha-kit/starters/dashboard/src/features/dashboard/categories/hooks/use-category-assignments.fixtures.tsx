import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import type { ReactNode } from 'react';
import { endpoints } from '@/constants/api';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { createTestQueryClient } from '@/test/render';
import type {
  CategoryAttributeResponse,
  ItemCategoryResponse,
} from '@/types/api/catalog';
import { useCategoryAssignments } from './use-category-assignments';

export const CATEGORIES: ItemCategoryResponse[] = [
  {
    id: 'cat-safety',
    parentId: null,
    code: 'SAFETY',
    name: 'Safety',
    isActive: true,
    itemCount: null,
    childCount: null,
  },
  {
    id: 'cat-hand',
    parentId: 'cat-safety',
    code: 'SAF-HAND',
    name: 'Hand protection',
    isActive: true,
    itemCount: null,
    childCount: null,
  },
];

export const ASSIGNMENTS: CategoryAttributeResponse[] = [
  {
    id: 'asg-1',
    sourceCategoryId: 'cat-safety',
    sourceCategoryName: null,
    unitLabel: null,
    options: null,
    inherited: true,
    attributeDefinitionId: 'attr-material',
    attributeCode: 'MATERIAL',
    attributeName: 'Material',
    dataType: 'TEXT',
    isRequired: true,
    isVariantAxis: false,
    sortOrder: 1,
  },
  {
    id: 'asg-2',
    sourceCategoryId: 'cat-hand',
    sourceCategoryName: null,
    unitLabel: null,
    options: null,
    inherited: false,
    attributeDefinitionId: 'attr-color',
    attributeCode: 'COLOR',
    attributeName: 'Color',
    dataType: 'OPTION',
    isRequired: false,
    isVariantAxis: true,
    sortOrder: 2,
  },
];

export function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

export function renderAssignments(
  categoryId: string | null = 'cat-hand',
  queryClient: QueryClient = createTestQueryClient(),
) {
  return renderHook(
    () => useCategoryAssignments({ categoryId, categories: CATEGORIES }),
    { wrapper: wrapperFor(queryClient) },
  );
}

export function mockList() {
  server.use(
    http.get(api(endpoints.itemCategories.attributes('cat-hand')), () =>
      HttpResponse.json(ASSIGNMENTS),
    ),
  );
}

export function createGate(): { promise: Promise<void>; release: () => void } {
  const resolvers: (() => void)[] = [];
  const promise = new Promise<void>((resolve) => {
    resolvers.push(resolve);
  });
  return {
    promise,
    release: () => {
      for (const resolve of resolvers) {
        resolve();
      }
    },
  };
}
