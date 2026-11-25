import type { MockApi } from '../fixtures/app';
import { mockWarehouses } from '../fixtures/warehouses';
import type { A11yPage } from './types';

/**
 * Accessibility entries for the warehouses feature. Shape mirrors the other
 * e2e/a11y-pages entries (name, path, guarded, mocks).
 */

const withWarehouses = async (mockApi: MockApi): Promise<void> => {
  await mockApi.shell();
  await mockWarehouses(mockApi);
};

export const pages: A11yPage[] = [
  {
    name: 'warehouses',
    path: '/warehouses',
    guarded: true,
    mocks: withWarehouses,
  },
  {
    name: 'warehouse detail',
    path: '/warehouses/wh-1',
    guarded: true,
    mocks: withWarehouses,
  },
  {
    name: 'warehouse members tab',
    path: '/warehouses/wh-1?tab=members',
    guarded: true,
    mocks: withWarehouses,
  },
  {
    name: 'warehouse locations tab',
    path: '/warehouses/wh-1?tab=locations',
    guarded: true,
    mocks: withWarehouses,
  },
  {
    name: 'warehouse not found',
    path: '/warehouses/wh-404',
    guarded: true,
    mocks: async (mockApi: MockApi): Promise<void> => {
      await mockApi.shell();
      await mockApi.json(
        '**/api/warehouses/wh-404',
        { message: 'not found' },
        404,
      );
    },
  },
];
