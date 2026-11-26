import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Unit and component tests. The TanStack Start plugin is deliberately not loaded here.
// End-to-end tests live in e2e/ and run through Playwright (npm run test:e2e).
//
// Two projects, so the plain-logic tests do not pay for a browser-like environment:
//   node  src/**/*.test.ts      pure functions: no window, no document, no storage.
//   dom   src/**/*.test.tsx     components and hooks (jsdom + src/test/setup.ts). A plain .ts test that
//         src/**/*.dom.test.ts  needs the browser (window, document, storage) is named *.dom.test.ts.
export default defineConfig({
  plugins: [viteReact()],
  resolve: { tsconfigPaths: true },
  test: {
    css: false,
    testTimeout: 15_000,
    hookTimeout: 15_000,
    restoreMocks: true,
    clearMocks: true,
    unstubEnvs: true,
    // Tests never depend on a developer's .env files.
    env: {
      VITE_SITE_URL: 'https://example.test',
      VITE_ALLOW_INDEXING: 'true',
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
        'src/router.tsx',
        'src/start.ts',
        'src/routes/**',
        'src/**/locales/**',
      ],
      // Start here and raise as tests grow. Pages and layout are covered by e2e, not by these numbers.
      thresholds: { lines: 60, functions: 50, branches: 70, statements: 60 },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
          exclude: ['src/**/*.dom.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          // One jsdom and one copy of the heavy libraries per worker instead of per file. Safe because
          // src/test/setup.ts resets what a test can leave behind (DOM, storage, stores, the theme attribute).
          // A test that adds module-level state must reset it there.
          isolate: false,
          environmentOptions: { jsdom: { url: 'http://localhost:5190' } },
          setupFiles: ['./src/test/setup.ts'],
          include: ['src/**/*.test.tsx', 'src/**/*.dom.test.ts'],
        },
      },
    ],
  },
});
