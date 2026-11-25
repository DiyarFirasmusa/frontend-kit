import type { MockApi } from '../fixtures/app';

/** One page scanned by e2e/a11y.spec.ts (axe, WCAG 2.1 A/AA). */
export interface A11yPage {
  name: string;
  path: string;
  guarded?: boolean;
  mocks?: (mockApi: MockApi) => Promise<void>;
}
