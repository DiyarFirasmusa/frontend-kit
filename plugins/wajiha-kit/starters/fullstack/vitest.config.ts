import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Unit and component tests (jsdom). The TanStack Start plugin is deliberately not loaded here.
// End-to-end tests live in e2e/ and run through Playwright (npm run test:e2e).
export default defineConfig({
  plugins: [viteReact()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost:5190' } },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
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
  },
});
