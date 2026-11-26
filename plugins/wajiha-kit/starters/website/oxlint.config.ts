import { defineConfig } from 'oxlint';

const I18NEXT_DEFAULT = {
  name: 'i18next',
  importNames: ['default'],
  message:
    'Never use a shared i18next instance: it is a race between visitors. Use the per-request instance (useTranslation) or getFixedT from @/shared/lib/i18n/create-i18n.',
};

const ZOD_DIRECT = {
  name: 'zod',
  message:
    "Import z from '@/shared/lib/zod': it turns zod's eval fast path off, which the strict CSP would report as a violation.",
};

export default defineConfig({
  ignorePatterns: [
    '**/routeTree.gen.ts',
    '.output/**',
    '.nitro/**',
    '.tanstack/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
  ],

  plugins: ['react', 'typescript', 'oxc', 'jsx-a11y', 'import', 'unicorn'],

  categories: {
    correctness: 'error',
    suspicious: 'warn',
    perf: 'warn',
  },

  rules: {
    curly: 'error',
    // Test hooks (window.__cls) and TanStack's _notFound marker use leading underscores on purpose.
    'eslint/no-underscore-dangle': 'off',
    // The automatic JSX runtime needs no React import.
    'react/react-in-jsx-scope': 'off',
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'error',
    'typescript/consistent-type-imports': 'error',
    'typescript/no-explicit-any': 'error',
    'typescript/ban-ts-comment': 'error',
    'typescript/no-non-null-assertion': 'error',
    'import/no-cycle': 'error',
    'eslint/no-console': ['error', { allow: ['warn', 'error'] }],
    'eslint/max-lines': ['error', { max: 400 }],
    'no-restricted-imports': ['error', { paths: [I18NEXT_DEFAULT, ZOD_DIRECT] }],
  },

  overrides: [
    // The one wrapper, and the env schema (it runs in Node at build time and server start, never in the
    // browser, with relative imports only, so it cannot use the "@/" wrapper).
    {
      files: ['src/shared/lib/zod.ts', 'src/shared/env/schema.ts'],
      rules: { 'no-restricted-imports': ['error', { paths: [I18NEXT_DEFAULT] }] },
    },
    {
      files: [
        'scripts/**',
        'e2e/**',
        '*.config.ts',
        'src/test/**',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
      rules: {
        'import/no-unassigned-import': 'off',
        'unicorn/consistent-function-scoping': 'off',
        'eslint/no-await-in-loop': 'off',
        'eslint/no-console': 'off',
        'typescript/no-non-null-assertion': 'off',
      },
    },
  ],
});
