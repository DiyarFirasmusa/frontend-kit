import type { MockApi } from '../fixtures/app';
import { mockUnitsOfMeasure } from '../fixtures/units-of-measure';
import type { A11yPage } from './types';

export const pages: A11yPage[] = [
  {
    name: 'units of measure',
    path: '/units-of-measure',
    guarded: true,
    mocks: async (mockApi: MockApi) => {
      await mockApi.shell();
      await mockUnitsOfMeasure(mockApi);
    },
  },
];
