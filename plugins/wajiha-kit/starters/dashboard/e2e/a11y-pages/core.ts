import type { A11yPage } from './types';

/**
 * Accessibility entries for the login and not-found pages. Feature entries live in
 * sibling files in this folder (the dashboard home is in home.ts); e2e/a11y.spec.ts
 * loads every one of them.
 */
export const pages: A11yPage[] = [
  { name: 'login', path: '/login' },
  { name: 'not found', path: '/this-route-does-not-exist' },
];
