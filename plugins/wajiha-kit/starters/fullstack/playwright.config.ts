import { defineConfig, devices } from '@playwright/test';
import type { AppOptions } from './e2e/fixtures/app';

// Runs against a production build served by the built server (SSR, head(), status codes, headers and
// hydration only behave for real there), on its own port. Never attaches to a server you started by hand.
// E2E_BASE_URL runs the same suite against an already deployed URL (no local server, no build).
const PORT = Number(process.env.E2E_PORT ?? 5191);
const EXTERNAL_URL = process.env.E2E_BASE_URL;
const BASE_URL = EXTERNAL_URL ?? `http://localhost:${PORT}`;
const CI = Boolean(process.env.CI);

const ui = { testMatch: /e2e\/ui\/.*\.spec\.ts/, testIgnore: /layout-shift/ };
const UI_PROJECTS = ['ar-desktop', 'en-desktop', 'ar-phone', 'en-phone', 'ar-dark', 'en-dark'];

export default defineConfig<AppOptions>({
  testDir: './e2e',
  outputDir: process.env.E2E_OUTPUT_DIR ?? './test-results',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    trace: 'retain-on-failure',
    video: CI ? 'retain-on-failure' : 'off',
  },
  projects: [
    // Language-free checks on the raw server response: no browser, no JavaScript, like a crawler.
    { name: 'raw', testMatch: /e2e\/raw\/.*\.spec\.ts/ },

    // Language x device x theme. The language is the URL prefix, so each project visits its own language.
    {
      name: 'ar-desktop',
      ...ui,
      use: { ...devices['Desktop Chrome'], language: 'ar', locale: 'ar' },
    },
    {
      name: 'en-desktop',
      ...ui,
      use: { ...devices['Desktop Chrome'], language: 'en', locale: 'en-US' },
    },
    { name: 'ar-phone', ...ui, use: { ...devices['Pixel 7'], language: 'ar', locale: 'ar' } },
    { name: 'en-phone', ...ui, use: { ...devices['Pixel 7'], language: 'en', locale: 'en-US' } },
    {
      name: 'ar-dark',
      ...ui,
      use: { ...devices['Desktop Chrome'], language: 'ar', locale: 'ar', colorScheme: 'dark' },
    },
    {
      name: 'en-dark',
      ...ui,
      use: { ...devices['Desktop Chrome'], language: 'en', locale: 'en-US', colorScheme: 'dark' },
    },

    // Performance budgets run last and alone: a busy machine delays font downloads and would measure the machine.
    {
      name: 'perf-ar-phone',
      testMatch: /e2e\/ui\/layout-shift\.spec\.ts/,
      dependencies: ['raw', ...UI_PROJECTS],
      fullyParallel: false,
      use: { ...devices['Pixel 7'], language: 'ar', locale: 'ar' },
    },
    {
      name: 'perf-en-desktop',
      testMatch: /e2e\/ui\/layout-shift\.spec\.ts/,
      dependencies: ['raw', ...UI_PROJECTS],
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'], language: 'en', locale: 'en-US' },
    },
  ],
  webServer: EXTERNAL_URL
    ? undefined
    : {
        command: 'node scripts/e2e-server.mjs',
        url: `${BASE_URL}/ar`,
        // The build runs inside this command, so give it room.
        timeout: 240_000,
        reuseExistingServer: false,
        stdout: 'pipe',
        stderr: 'pipe',
        env: { E2E_PORT: String(PORT) },
      },
});
