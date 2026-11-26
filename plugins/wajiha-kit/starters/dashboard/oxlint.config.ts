import { readdirSync } from 'node:fs';
import { defineConfig, type OxlintOverride } from 'oxlint';

/*
 * Layer boundaries (no-restricted-imports), generated from the folders so a
 * new feature is covered without editing this file:
 *   - shared code (components, lib, utils, hooks, ...) never imports a feature,
 *     a layout or a route;
 *   - a feature never imports another feature, a layout or a route, and never
 *     reaches out of its own folder with a relative path (use `@/` across);
 *   - `features/fallback` is the shared error-screens feature: any feature may
 *     import it.
 * Both the `@/` form and relative paths are matched, at every folder depth, by
 * regex on the import source. `scripts/probe-lint-boundaries.ts` proves it.
 */
export const FEATURES_DIR = 'src/features';
export const SHARED_FEATURE = 'fallback';
export const SHARED_DIRS = [
  'components',
  'constants',
  'context',
  'guards',
  'hooks',
  'lib',
  'mocks',
  'services',
  'store',
  'types',
  'utils',
  'validations',
];
/** Deepest folder nesting inside a feature that the relative-path rule covers. */
export const MAX_FEATURE_DEPTH = 8;

function subfolders(path: string): string[] {
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

/** `<group>/<feature>`, or just `fallback` for the shared error screens. */
export const FEATURE_ROOTS = subfolders(FEATURES_DIR).flatMap((group) =>
  group === SHARED_FEATURE
    ? [group]
    : subfolders(`${FEATURES_DIR}/${group}`).map((name) => `${group}/${name}`),
);

const ALIAS_ONLY_ABOVE = '(features|layout|routes)';

const AXIOS_PATH = {
  name: 'axios',
  message:
    'Import axios only inside src/api/**; use getErrorStatus / getErrorData / isNotFoundError from @/api/error/api-error elsewhere.',
};

/** Shared code: nothing from features, layouts or routes, by alias or relative path. */
const sharedPatterns = [
  {
    regex: `^@/${ALIAS_ONLY_ABOVE}(/|$)`,
    message:
      'Shared code must not import a feature, a layout or a route. Move the shared part down into src/ instead.',
  },
  {
    regex: `^(\\.{1,2}/)+${ALIAS_ONLY_ABOVE}(/|$)`,
    message:
      'Shared code must not import a feature, a layout or a route (relative paths included).',
  },
];

/** Another feature's alias path: every feature except this one and the shared one. */
function featurePatterns(root: string, depth: number) {
  const others = FEATURE_ROOTS.filter(
    (other) => other !== root && other !== SHARED_FEATURE,
  );
  return [
    ...(others.length > 0
      ? [
          {
            regex: `^@/features/(${others.join('|')})(/|$)`,
            message:
              'A feature never imports another feature. Move the shared part down into src/ (a file lives in the deepest folder that contains every importer).',
          },
        ]
      : []),
    {
      regex: '^@/(layout|routes)(/|$)',
      message: 'A feature never imports a layout or a route.',
    },
    {
      // `../` x (depth + 1) leaves the feature folder.
      regex: `^(\\.\\./){${depth + 1},}`,
      message:
        'A relative import must stay inside its feature folder; use `@/` to reach shared code.',
    },
  ];
}

const nested = (depth: number) => '*/'.repeat(depth);
const TEST_EXTENSIONS = ['*.test.ts', '*.test.tsx'];

function sharedOverrides(): OxlintOverride[] {
  return SHARED_DIRS.flatMap((dir) => [
    {
      files: [`src/${dir}/**`],
      rules: {
        'no-restricted-imports': [
          'error',
          { paths: [AXIOS_PATH], patterns: sharedPatterns },
        ],
      },
    },
    {
      // Tests may import axios (to build errors); the boundary still holds.
      files: TEST_EXTENSIONS.map((ext) => `src/${dir}/**/${ext}`),
      rules: {
        'no-restricted-imports': ['error', { patterns: sharedPatterns }],
      },
    },
  ]);
}

/** One override per feature and folder depth: the relative rule needs the depth. */
function featureOverrides(): OxlintOverride[] {
  return FEATURE_ROOTS.flatMap((root) =>
    Array.from({ length: MAX_FEATURE_DEPTH + 1 }, (_, depth) => depth).flatMap(
      (depth) => {
        const folder = `${FEATURES_DIR}/${root}/${nested(depth)}`;
        const rule = (
          paths: (typeof AXIOS_PATH)[],
        ): OxlintOverride['rules'] => ({
          'no-restricted-imports': [
            'error',
            { paths, patterns: featurePatterns(root, depth) },
          ],
        });
        return [
          {
            files: [`${folder}*.ts`, `${folder}*.tsx`],
            rules: rule([AXIOS_PATH]),
          },
          {
            files: TEST_EXTENSIONS.map((ext) => `${folder}${ext}`),
            rules: rule([]),
          },
        ];
      },
    ),
  );
}

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

    // CLAUDE.md "no `as` to silence the compiler": narrow with a type guard or
    // zod instead. `as const` stays allowed. Vendored code and tests are
    // switched off in the overrides below.
    'typescript/consistent-type-assertions': [
      'error',
      { assertionStyle: 'never' },
    ],

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
      // The API layer talks to stores and services only, never to hooks or UI.
      files: ['src/api/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                regex: '^@/(features|layout|routes|hooks|components)(/|$)',
                message:
                  'The API layer must not import UI, hooks or features. Announce events (see api/auth/session-hooks.ts) instead.',
              },
              {
                regex:
                  '^(\\.{1,2}/)+(features|layout|routes|hooks|components)(/|$)',
                message:
                  'The API layer must not import UI, hooks or features (relative paths included).',
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
    {
      // Vendored shadcn/ui and third-party glue keep the upstream style, and a
      // test may cast a fixture or a mock response; production code may not.
      files: [
        'src/components/ui/**',
        'src/lib/vendor/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        'src/test/**',
        'e2e/**',
        'scripts/**',
      ],
      rules: { 'typescript/consistent-type-assertions': 'off' },
    },
    {
      // The mock backend's one typed boundary: a request body is read as the
      // contract type here, and every handler validates it before use.
      files: ['src/mocks/core.ts'],
      rules: { 'typescript/consistent-type-assertions': 'off' },
    },
    ...sharedOverrides(),
    ...featureOverrides(),
  ],
});
