import { defineConfig, devices } from '@playwright/test';
import type { AppOptions } from './e2e/fixtures/app';
import { LANGUAGES, LOCALES } from './src/shared/lib/i18n/languages';

// Runs against a production build served by the built server (SSR, head(), status codes, headers and
// hydration only behave for real there), on its own port. Never attaches to a server you started by hand.
// E2E_BASE_URL runs the same suite against an already deployed URL (no local server, no build).
const PORT = Number(process.env.E2E_PORT ?? 5191);
const EXTERNAL_URL = process.env.E2E_BASE_URL;
const BASE_URL = EXTERNAL_URL ?? `http://localhost:${PORT}`;
const CI = Boolean(process.env.CI);

const ui = { testMatch: /e2e\/ui\/.*\.spec\.ts/, testIgnore: /layout-shift/ };

// Projects are built from the language registry, so a new language in LOCALES gets its own without an edit
// here. The language is the URL prefix; `locale` is the browser's own language.
const DEVICES = [
  { suffix: 'desktop', device: devices['Desktop Chrome'], dark: false },
  { suffix: 'phone', device: devices['Pixel 7'], dark: false },
  { suffix: 'dark', device: devices['Desktop Chrome'], dark: true },
] as const;

const UI_PROJECTS = LOCALES.flatMap((language) =>
  DEVICES.map((entry) => ({
    name: `${language}-${entry.suffix}`,
    ...ui,
    use: {
      ...entry.device,
      language,
      locale: LANGUAGES[language].hreflang,
      ...(entry.dark ? { colorScheme: 'dark' as const } : {}),
    },
  })),
);

// Performance budgets run last and alone: a busy machine delays font downloads and would measure the machine.
const PERF_PROJECTS = LOCALES.flatMap((language) =>
  DEVICES.filter((entry) => !entry.dark).map((entry) => ({
    name: `perf-${language}-${entry.suffix}`,
    testMatch: /e2e\/ui\/layout-shift\.spec\.ts/,
    dependencies: ['raw', ...UI_PROJECTS.map((project) => project.name)],
    fullyParallel: false,
    use: { ...entry.device, language, locale: LANGUAGES[language].hreflang },
  })),
);

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
    ...UI_PROJECTS,
    ...PERF_PROJECTS,
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
