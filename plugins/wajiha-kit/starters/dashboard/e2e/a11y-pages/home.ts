import { homeMocks } from '../fixtures/home';
import type { A11yPage } from './types';

/**
 * Accessibility entry for the dashboard home (/). Shape mirrors the other
 * entries in e2e/a11y-pages/ (name, path, guarded, mocks).
 */
export const pages: A11yPage[] = [
  {
    name: 'dashboard home',
    path: '/',
    guarded: true,
    mocks: async (mockApi) => {
      await mockApi.shell();
      await homeMocks(mockApi);
    },
  },
];
