import type { MockApi } from '../fixtures/app';
import type { A11yPage } from './types';

/**
 * Accessibility entries for the category tree and the attributes list. The
 * shared demo backend (src/mocks) serves both: no fixture file per entity.
 * DEFAULT_PERMISSIONS already covers item_category:* and attribute_definition:*.
 */
const withBackend = async (mockApi: MockApi): Promise<void> => {
  await mockApi.backend();
};

export const pages: A11yPage[] = [
  {
    name: 'categories',
    path: '/categories',
    guarded: true,
    mocks: withBackend,
  },
  {
    name: 'attributes',
    path: '/attributes',
    guarded: true,
    mocks: withBackend,
  },
];
