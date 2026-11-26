import { defineConfig, devices } from '@playwright/test';
import type { Language, Theme } from './e2e/fixtures/app';

/* Dedicated port so the suite never attaches to another project's dev
   server that happens to be on :3000. */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const IS_CI = !!process.env.CI;

/**
 * End-to-end tests (`e2e/`). The backend is mocked with `page.route` inside
 * the fixtures, so the suite runs against the Vite dev server alone.
 *
 * Every spec runs once per project below — Arabic/RTL and English/LTR, light
 * and dark — which is the manual walk the project rules require, automated.
 */
interface AppOptions {
  language: Language;
  theme: Theme;
}

export default defineConfig<AppOptions>({
  testDir: './e2e',
  /* Loads the app once before the workers start, so the first wave of tests
     does not time out while Vite transforms every module on a cold start. */
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 2 : undefined,
  reporter: IS_CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  outputDir: 'test-results',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'ar-light',
      use: { ...devices['Desktop Chrome'], language: 'ar', theme: 'light' },
    },
    {
      name: 'en-light',
      use: { ...devices['Desktop Chrome'], language: 'en', theme: 'light' },
    },
    {
      name: 'ar-dark',
      use: { ...devices['Desktop Chrome'], language: 'ar', theme: 'dark' },
    },
    {
      name: 'en-dark',
      use: { ...devices['Desktop Chrome'], language: 'en', theme: 'dark' },
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    env: {
      VITE_ENV: 'test',
      /* The e2e fixtures mock the API with page.route; the in-browser mock stays off. */
      VITE_USE_MOCK: 'false',
      /* Dedicated origin so Playwright route mocks intercept API calls. */
      VITE_API_BASE_URL: 'http://api.e2e.test',
      VITE_AUTH_BASE_URL: 'http://auth.e2e.test',
    },
    /* Never reuse a server already on the port: one started by hand without
       the env above would serve the real API/auth origins and bypass the
       route mocks with failures that are hard to trace. With strictPort, a
       busy port fails the run loudly instead; stop that server or set
       E2E_PORT to run the suite. */
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
