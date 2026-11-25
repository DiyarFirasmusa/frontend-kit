import { fileURLToPath } from 'node:url';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Unit + component + integration tests (jsdom). End-to-end tests live in
// `e2e/` and run through Playwright (`bun run test:e2e`), not here.
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
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    testTimeout: 15_000,
    hookTimeout: 15_000,
    restoreMocks: true,
    clearMocks: true,
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
