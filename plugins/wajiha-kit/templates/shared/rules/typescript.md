---
paths:
  - "tsconfig*.json"
  - "**/tsconfig*.json"
---

# tsconfig (TypeScript 5.9 to 7)

Read the installed compiler's defaults before you write config from memory (`npx tsc --version`, `npx tsc --help`).

## Every project

- A solution-style config (`"references"` with `"files": []`) checks nothing under `tsc --noEmit` and exits 0 silently. Use
  `tsc -b`, or a flat `tsconfig.json` that covers the code.
- TypeScript 6 changed defaults: `types` is `[]`, so list the globals you need (`"types": ["node"]`); `rootDir` is the
  tsconfig's folder, so set it when the output layout relied on inference.
- `baseUrl` is deprecated: use `paths` with relative targets (`"./src/*"`). `moduleResolution`: `bundler` for bundled app
  code, `nodenext` for Node scripts; never `node10` or `classic`.
- `ignoreDeprecations` only postpones the error: TypeScript 7 removes those options, so fix the config.
- TypeScript 7.0 has no compiler API. Tools that import `typescript` (typescript-eslint supports below 6.1) keep a 6.0
  alias (`@typescript/typescript6`). Never hide that peer error with `--force` or `--legacy-peer-deps`.

## Strictness: set in a new project, proposed in an existing one

Turning a flag on inside another task breaks code outside its scope.

- `strict: true`, and `noUncheckedIndexedAccess`: an index into `string[]` is then `string | undefined`.
- `verbatimModuleSyntax: true`: type-only imports stay `import type`.
- `erasableSyntaxOnly: true` (5.8+) forbids `enum`, runtime namespaces and parameter properties, for code that Node runs
  directly or a project without enums.
