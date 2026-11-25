import { defineConfig } from 'oxlint';

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
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'i18next',
            importNames: ['default'],
            message:
              'Never use a shared i18next instance: it is a race between visitors. Use the per-request instance (useTranslation) or getFixedT from @/shared/lib/i18n/create-i18n.',
          },
        ],
      },
    ],
  },

  overrides: [
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
