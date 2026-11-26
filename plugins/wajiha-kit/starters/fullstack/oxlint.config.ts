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

const BASE_PATHS = [I18NEXT_DEFAULT, AXIOS_OUTSIDE_ADMIN_API];

// TanStack Query and MSW belong to the admin (CLAUDE.md: "admin only"; a build with the mock off must contain no MSW).
const ADMIN_ONLY_PACKAGES = [
  {
    name: '@tanstack/react-query',
    message: 'TanStack Query is admin only. The public site fetches on the server.',
  },
  { name: 'msw', message: 'MSW is the admin mock API; the public site never imports it.' },
  { name: 'msw/browser', message: 'MSW is the admin mock API; the public site never imports it.' },
  { name: 'msw/node', message: 'MSW is the admin mock API; the public site never imports it.' },
];

const SHARED_NO_FEATURES = {
  group: ['@/features/**', '@/routes/**', '../**/features/**', '../**/routes/**'],
  message:
    'Shared code must not import a feature or a route. Move the shared part into src/components or src/shared.',
};
const NO_SERVER_CODE = {
  group: ['@/shared/server/**', '../**/shared/server/**'],
  message:
    'src/components is client code. Server-only code (src/shared/server) is not importable here.',
};
const NO_SITE = {
  group: ['@/features/site', '@/features/site/**', '../**/site', '../**/site/**'],
  message:
    'The admin never imports the public site. Shared code goes in src/components or src/shared.',
};
const NO_MOCKS = {
  group: ['@/features/admin/mocks', '@/features/admin/mocks/**', '../**/mocks', '../**/mocks/**'],
  message: 'Nothing outside mocks/start-mocks.ts (loaded by the admin route) imports the mock API.',
};
const NO_RAW_API_CLIENT = {
  group: [
    '@/features/admin/api/client',
    '@/features/admin/api/endpoints',
    '../**/api/client',
    '../**/api/endpoints',
  ],
  message:
    'Components, pages and hooks never call axios: go through <x>.service.ts (see api-layer.md).',
};
const NO_STATIC_ADMIN = {
  group: [
    '@/features/admin',
    '@/features/admin/**',
    './features/admin/**',
    '../**/features/admin',
    '../**/features/admin/**',
  ],
  message: 'Public entry files never import the admin statically. Use import() in beforeLoad.',
};
const NO_ROUTES = {
  group: ['@/routes/**', '../**/routes/**'],
  message:
    'Features never import route files (the route imports the feature). Use getRouteApi(path) for typed route access.',
};
const NO_TEST_HELPERS = {
  group: ['@/test/**', '../**/test/**'],
  message: 'src/test is for tests only.',
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
    // other; shared code never imports a feature or a route; only <x>.service.ts and api/ call axios; nothing
    // but tests imports the mocks or src/test. Each rule lists the "@/" spelling AND the relative spelling (any
    // depth). Later blocks REPLACE earlier ones for the same rule (no merge), so every block lists
    // everything that applies to its files; the helpers keep that readable.
    {
      files: ['src/components/**', 'src/shared/**', 'src/style/**', 'src/config/**'],
      rules: {
        'no-restricted-imports': ['error', { paths: BASE_PATHS, patterns: [SHARED_NO_FEATURES] }],
      },
    },
    // UI components (src/components) are client code: they never import server-only code.
    {
      files: ['src/components/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          { paths: BASE_PATHS, patterns: [SHARED_NO_FEATURES, NO_SERVER_CODE] },
        ],
      },
    },
    {
      files: ['src/features/site/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [...BASE_PATHS, ...ADMIN_ONLY_PACKAGES],
            patterns: [
              {
                group: ['@/features/admin', '@/features/admin/**', '../**/admin', '../**/admin/**'],
                message:
                  'The public site never imports the admin. Shared code goes in src/components or src/shared.',
              },
              NO_TEST_HELPERS,
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
            paths: BASE_PATHS,
            patterns: [NO_SITE, NO_ROUTES, NO_MOCKS, NO_RAW_API_CLIENT, NO_TEST_HELPERS],
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
              NO_MOCKS,
              NO_TEST_HELPERS,
            ],
          },
        ],
      },
    },
    // Only the service files (and the api folder above) call the axios clients; pages, hooks and
    // components go through <x>.service.ts and use-<x>-queries.ts.
    {
      files: ['src/features/admin/**/*.service.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          { paths: BASE_PATHS, patterns: [NO_SITE, NO_MOCKS, NO_TEST_HELPERS] },
        ],
      },
    },
    // The mock API is the only admin code that may import its own files.
    {
      files: ['src/features/admin/mocks/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          { paths: BASE_PATHS, patterns: [NO_SITE, NO_TEST_HELPERS] },
        ],
      },
    },
    // Route files, the router and the server entry are in the public entry chunk: they never import the admin
    // statically (the admin route files below may: the split properties keep it out, and check:bundle proves it).
    {
      files: ['src/routes/**', 'src/router.tsx', 'src/start.ts'],
      rules: {
        'no-restricted-imports': ['error', { paths: BASE_PATHS, patterns: [NO_STATIC_ADMIN] }],
      },
    },
    {
      files: ['src/routes/$locale_/**'],
      rules: { 'no-restricted-imports': ['error', { paths: BASE_PATHS }] },
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
