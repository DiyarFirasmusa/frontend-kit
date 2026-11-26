import { defineConfig } from 'oxlint';

const I18NEXT_DEFAULT = {
  name: 'i18next',
  importNames: ['default'],
  message:
    'Never use a shared i18next instance: it is a race between visitors. Use the per-request instance (useTranslation) or getFixedT from @/features/site/i18n/resources.',
};

const AXIOS_OUTSIDE_ADMIN_API = {
  name: 'axios',
  message:
    'Import axios only inside src/features/admin/api; use the clients and helpers it exports.',
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
    'public/mockServiceWorker.js',
    '.lint-probe/**',
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
    // Table columns hand a render function to the DataTable (cell: row => ...); that is a prop, not a component.
    'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],
    // A wide table sits in a focusable, labelled <section> so keyboard users can scroll it (axe asks for it).
    'jsx-a11y/no-noninteractive-tabindex': ['error', { tags: ['section'] }],
    'react/exhaustive-deps': 'error',
    'typescript/consistent-type-imports': 'error',
    'typescript/no-explicit-any': 'error',
    'typescript/ban-ts-comment': 'error',
    'typescript/no-non-null-assertion': 'error',
    'import/no-cycle': 'error',
    'eslint/no-console': ['error', { allow: ['warn', 'error'] }],
    'eslint/max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
    'no-restricted-imports': ['error', { paths: [I18NEXT_DEFAULT, AXIOS_OUTSIDE_ADMIN_API] }],
  },

  overrides: [
    // The Label primitive receives htmlFor from its caller (FormLabel passes the control's id).
    {
      files: ['src/components/ui/label.tsx'],
      rules: { 'jsx-a11y/label-has-associated-control': 'off' },
    },
    // Boundaries. The two parts of the project (src/features/site and src/features/admin) never import each
    // other; shared code (src/components, src/shared, src/style, src/config) never imports a feature or a
    // route. Code both parts need moves down into shared code. Each rule lists the "@/" spelling AND the
    // relative spelling (../../admin/x, any depth): a relative path is the same import in disguise.
    // "npm run check:boundaries" writes probe files and proves every rule still fires.
    {
      files: ['src/components/**', 'src/shared/**', 'src/style/**', 'src/config/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [I18NEXT_DEFAULT, AXIOS_OUTSIDE_ADMIN_API],
            patterns: [
              {
                group: ['@/features/**', '@/routes/**', '../**/features/**', '../**/routes/**'],
                message:
                  'Shared code must not import a feature or a route. Move the shared part into src/components or src/shared.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/features/site/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [I18NEXT_DEFAULT, AXIOS_OUTSIDE_ADMIN_API],
            patterns: [
              {
                group: ['@/features/admin', '@/features/admin/**', '../**/admin', '../**/admin/**'],
                message:
                  'The public site never imports the admin. Shared code goes in src/components or src/shared.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/features/admin/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [I18NEXT_DEFAULT, AXIOS_OUTSIDE_ADMIN_API],
            patterns: [
              {
                group: ['@/features/site', '@/features/site/**', '../**/site', '../**/site/**'],
                message:
                  'The admin never imports the public site. Shared code goes in src/components or src/shared.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/features/admin/api/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [I18NEXT_DEFAULT],
            patterns: [
              {
                group: [
                  '@/features/site',
                  '@/features/site/**',
                  '@/routes/**',
                  '@/components/**',
                  '../**/site',
                  '../**/site/**',
                  '../**/routes/**',
                  '../**/components/**',
                ],
                message:
                  'The API layer talks to stores and services only, never to UI. Announce events instead (session-events.ts).',
              },
            ],
          },
        ],
      },
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
        'no-restricted-imports': 'off',
        'eslint/max-lines': ['error', { max: 600, skipBlankLines: true, skipComments: true }],
      },
    },
  ],
});
