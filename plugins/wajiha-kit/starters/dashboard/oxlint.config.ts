import { defineConfig } from 'oxlint';

export default defineConfig({
  ignorePatterns: [
    'dist/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'src/routeTree.gen.ts',
    'public/mockServiceWorker.js',
  ],

  categories: {
    correctness: 'warn',
    suspicious: 'warn',
    pedantic: 'warn',
    perf: 'warn',
  },

  rules: {
    curly: 'error',
    'no-unused-expressions': 'off',

    'oxc/no-map-spread': 'off',

    // No escape hatches: no any, no @ts-ignore, no lint-disable comments.
    'typescript/no-explicit-any': 'error',
    'typescript/ban-ts-comment': 'error',
    'eslint/no-warning-comments': 'off',
    'oxc/no-barrel-file': 'off',

    'typescript/consistent-type-imports': 'warn',

    // Pedantic rules that only add noise here.
    'eslint/require-unicode-regexp': 'off',
    'eslint/no-shadow': 'off',
    'eslint/max-lines-per-function': 'off',
    'eslint/max-classes-per-file': 'off',
    'eslint/no-await-in-loop': 'off',
    'eslint/no-negated-condition': 'off',
    'unicorn/no-negated-condition': 'off',
    // Built for window.postMessage; BroadcastChannel.postMessage (the cross-tab
    // session sync) takes no target origin, so every call would be flagged.
    'unicorn/require-post-message-target-origin': 'off',
    'eslint/require-await': 'off',

    // Files stay under 400 lines (blank lines and comments do not count).
    'eslint/max-lines': [
      'error',
      { max: 400, skipBlankLines: true, skipComments: true },
    ],

    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'axios',
            message:
              'Import axios only inside src/api/**; use getErrorStatus / getErrorData / isNotFoundError from @/api/error/api-error elsewhere.',
          },
        ],
      },
    ],
  },

  overrides: [
    {
      // Shared layers never reach into a feature, the layouts or the app hooks.
      files: [
        'src/components/**',
        'src/lib/**',
        'src/utils/**',
        'src/hooks/**',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'axios',
                message: 'Import axios only inside src/api/**.',
              },
            ],
            patterns: [
              {
                group: ['@/features/*', '@/layout/*', '@/routes/*'],
                message:
                  'Shared code (components, lib, utils, hooks) must not import a feature, a layout or a route. Move the shared part down instead.',
              },
            ],
          },
        ],
      },
    },
    {
      // The API layer talks to stores and services only, never to hooks or UI.
      files: ['src/api/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@/features/*',
                  '@/layout/*',
                  '@/routes/*',
                  '@/hooks/*',
                  '@/components/*',
                ],
                message:
                  'The API layer must not import UI, hooks or features. Announce events (see api/auth/session-hooks.ts) instead.',
              },
            ],
          },
        ],
      },
    },
    {
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        'src/test/**',
        'e2e/**',
        'scripts/**',
      ],
      rules: {
        'no-restricted-imports': 'off',
        'eslint/max-lines': [
          'error',
          { max: 600, skipBlankLines: true, skipComments: true },
        ],
      },
    },
  ],
});
