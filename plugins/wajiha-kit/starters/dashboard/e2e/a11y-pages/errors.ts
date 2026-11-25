import type { MockApi } from '../fixtures/app';
import type { A11yPage } from './types';

export const pages: A11yPage[] = [
  { name: 'server error route', path: '/500' },
  {
    name: 'in-shell server error',
    path: '/units-of-measure',
    guarded: true,
    mocks: async (mockApi: MockApi) => {
      await mockApi.shell();
      await mockApi.json('**/api/units-of-measure*', { message: 'boom' }, 500);
    },
  },
];
