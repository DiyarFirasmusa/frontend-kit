import type { MockApi } from '../fixtures/app';
import type { A11yPage } from './types';

export const pages: A11yPage[] = [
  {
    name: 'suppliers',
    path: '/suppliers',
    guarded: true,
    // The shared demo backend (src/mocks): no fixture file per entity.
    mocks: async (mockApi: MockApi) => {
      await mockApi.backend();
    },
  },
];
