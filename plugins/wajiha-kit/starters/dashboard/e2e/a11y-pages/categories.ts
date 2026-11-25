import type { MockApi } from '../fixtures/app';
import { mockCategories } from '../fixtures/categories';
import type { A11yPage } from './types';

/**
 * Accessibility entries for the categories and attributes pages. Shape mirrors
 * e2e/a11y-pages/warehouses.ts (name, path, guarded, mocks). DEFAULT_PERMISSIONS
 * already covers item_category:* and attribute_definition:* (derived from PERMS).
 */

const withCategories = async (mockApi: MockApi): Promise<void> => {
  await mockApi.shell();
  await mockCategories(mockApi);
};

export const pages: A11yPage[] = [
  {
    name: 'categories',
    path: '/categories',
    guarded: true,
    mocks: withCategories,
  },
  {
    name: 'attributes',
    path: '/attributes',
    guarded: true,
    mocks: withCategories,
  },
];
