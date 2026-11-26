import { fileURLToPath } from 'node:url';
import viteReact from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

/* These files call vi.resetModules(). In a worker that shares modules
   (isolate: false) that leaves the next file with a second copy of the MSW
   server and the API clients, and its requests fail with 'Network Error'; which
   files were hit depended on the run order. They run on their own, with a fresh
   module graph per file: `npm run test` runs vitest twice, the second time with
   VITEST_ISOLATED=1 (scripts/test-isolated.ts). */
const RESETS_MODULES = ['src/env.test.ts', 'src/lib/monitoring.test.ts'];
const ISOLATED = process.env.VITEST_ISOLATED === '1';

// Unit + component + integration tests (jsdom). End-to-end tests live in
// `e2e/` and run through Playwright (`npm run test:e2e`), not here.
export default defineConfig({
  plugins: [viteReact()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost:3000' },
    },
    setupFiles: ['./src/test/setup.ts'],
    /* Speed: most of a run was importing the same modules (React, the router,
       icons, i18n) again for every file. Without isolation a worker imports
       them once and reuses them; test/setup.ts resets the stores, storage,
       MSW handlers and the mock database after every test, and no test uses
       vi.mock (a module mock would leak across files here). */
    isolate: ISOLATED,
    include: ISOLATED ? RESETS_MODULES : ['src/**/*.test.{ts,tsx}'],
    exclude: ISOLATED
      ? configDefaults.exclude
      : [...configDefaults.exclude, ...RESETS_MODULES],
    css: false,
    testTimeout: 15_000,
    hookTimeout: 15_000,
    restoreMocks: true,
    clearMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    env: {
      VITE_ENV: 'test',
      VITE_API_BASE_URL: 'http://api.test',
      VITE_AUTH_BASE_URL: 'http://auth.test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/routeTree.gen.ts',
        'src/main.tsx',
        'src/router.tsx',
        'src/routes/**',
        'src/types/**',
        'src/lib/vendor/**',
        'src/**/locales/**',
      ],
    },
  },
});
