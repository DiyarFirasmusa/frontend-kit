---
paths:
  - "tsconfig*.json"
  - "**/tsconfig*.json"
---

# tsconfig (TypeScript 5.9 to 7)

Read the installed compiler's own defaults before you write config from memory (`npx tsc --version`, `npx tsc --help`).

- `strict: true`. Add `noUncheckedIndexedAccess`: an index into `string[]` is `string | undefined`, and the type should say so.
- TypeScript 6 changed defaults: `types` defaults to `[]`, so list the globals you need (`"types": ["node"]`). `baseUrl` is
  deprecated; use `paths` without it. TypeScript 7 removes the deprecated options, and `ignoreDeprecations` only postpones
  that, so fix the config.
- A solution-style config (`"references"` with `"files": []`) checks nothing under `tsc --noEmit` and exits 0 silently. Use
  `tsc -b`, or a flat `tsconfig.json` that covers the code.
- `erasableSyntaxOnly: true` (TypeScript 5.8+) forbids `enum`, runtime namespaces and parameter properties. It matches the
  no-enum rule in `react.md`.
- `verbatimModuleSyntax: true` keeps imports explicit; type-only imports stay `import type`.
