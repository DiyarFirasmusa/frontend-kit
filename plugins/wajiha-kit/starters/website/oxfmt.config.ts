import { defineConfig } from 'oxfmt';

export default defineConfig({
  printWidth: 100,
  singleQuote: true,
  semi: true,
  sortTailwindcss: {},
  sortImports: { enabled: true, newlinesBetween: false },
  ignorePatterns: [
    '**/routeTree.gen.ts',
    '.output/**',
    '.nitro/**',
    '.tanstack/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'package-lock.json',
    // Written as a documented config with comments that a formatter would reflow.
    'deploy/**',
    'STRUCTURE.md',
  ],
});
