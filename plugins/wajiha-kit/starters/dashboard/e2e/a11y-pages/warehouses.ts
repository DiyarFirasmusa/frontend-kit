import { warehouseId } from '../../src/mocks/seed/warehouses';
import type { MockApi } from '../fixtures/app';
import type { A11yPage } from './types';

/**
 * Accessibility entries for the warehouses feature. The detail pages use the
 * seeded id of the first warehouse (src/mocks/seed/warehouses.ts).
 */

const FIRST_WAREHOUSE_ID = warehouseId(0);

const backend = async (mockApi: MockApi): Promise<void> => {
  await mockApi.backend();
};

export const pages: A11yPage[] = [
  {
    name: 'warehouses',
    path: '/warehouses',
    guarded: true,
    mocks: backend,
  },
  {
    name: 'warehouse detail',
    path: `/warehouses/${FIRST_WAREHOUSE_ID}`,
    guarded: true,
    mocks: backend,
  },
  {
    name: 'warehouse members tab',
    path: `/warehouses/${FIRST_WAREHOUSE_ID}?tab=members`,
    guarded: true,
    mocks: backend,
  },
  {
    name: 'warehouse locations tab',
    path: `/warehouses/${FIRST_WAREHOUSE_ID}?tab=locations`,
    guarded: true,
    mocks: backend,
  },
  {
    name: 'warehouse not found',
    path: '/warehouses/wh-404',
    guarded: true,
    mocks: backend,
  },
];
