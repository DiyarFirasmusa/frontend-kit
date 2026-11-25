import type { MockApi } from '../fixtures/app';
import { supplierRows } from '../fixtures/suppliers';
import type { A11yPage } from './types';

export const pages: A11yPage[] = [
  {
    name: 'suppliers',
    path: '/suppliers',
    guarded: true,
    mocks: async (mockApi: MockApi) => {
      await mockApi.shell();
      await mockApi.json('**/api/suppliers*', supplierRows);
    },
  },
];
