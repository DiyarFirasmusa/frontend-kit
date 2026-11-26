# CLAUDE.md

An admin dashboard starter: signed-in staff list, filter, create, edit and delete
records behind permission checks. Arabic (RTL, the default) and English (LTR),
light and dark. Runs on in-browser mock data, so it works without a backend.

Stack: React 19 SPA on Vite, TypeScript (strict), TanStack Router (file routes,
typed search params), TanStack Query 5, TanStack Table 9, Zustand 5 (client
state only), axios, react-hook-form + zod 4, Base UI primitives, Tailwind CSS 4
(tokens generated from TypeScript), i18next, sonner, Sentry (optional).
Tests: Vitest + Testing Library + MSW, Playwright + axe. oxlint, oxfmt, husky +
lint-staged + commitlint. Package manager: **npm**. Node 22.18 or newer.

`STRUCTURE.md` (Arabic) explains every folder and why. `PERMISSIONS.md` lists who
sees and does what. Area rules live in `.claude/rules/` and load when you read or
edit a matching file.

## Hard rules

- Every file under `src/` is `.ts` / `.tsx`. No `any`, no `@ts-ignore`, no lint
  disable comments, no `as` to silence the compiler: use `unknown` and narrow.
- Files stay under 400 lines (tests under 600); lint fails above. Blank lines and
  comments do not count.
- `src/routeTree.gen.ts`, `src/style/theme.css` and `src/style/preset.css` are
  generated (`npm run routes`, `npm run tokens`). Never edit them.
- The URL owns a list's page, size, sort and filters; the Query cache owns server
  data. Neither is copied into `useState` or Zustand.
- Layer boundaries are a lint rule, not a habit: shared code (`components`,
  `hooks`, `lib`, `utils`, `constants`, `services`, `store`, `types`,
  `validations`, `guards`, `context`, `mocks`) never imports a feature, a layout
  or a route; a feature never imports another feature (except `features/fallback`)
  and never leaves its folder with a relative path. `npm run lint:probe` proves it.
- Only the API clients (`src/api`) toast API results, unwrap responses and handle 401. `axios` is imported only inside `src/api`.
- Every route behind login has `requirePermission(PERMS.x.view)`; every action is
  gated with `useCan()` / `<Can>`. The backend still decides.
- A submit or a destructive action is single-flight; delete asks to confirm and
  focus starts on Cancel.
- No hardcoded user-facing strings: every string goes in both `ar` and `en`.
- Logical CSS only (`ms-`, `pe-`, `start-`, `text-start`); no hex colours in
  components; `text-primary-text` for text, `primary` is a fill.
- Tests never use `vi.mock` (modules are shared between files). The mock backend
  in `src/mocks` serves the browser, unit tests and Playwright.
- Public repo: no real company, client, host or person names in code, data or docs.

## Folder map

```text
src/
├── routes/           thin file routes: guard + validateSearch + loader + container
├── features/<group>/<entity>/   one folder per backend resource (the recipe below)
│   ├── auth/ dashboard/ fallback/   (fallback = shared error screens)
├── layout/           auth and dashboard shells (sidebar nav config, topbar)
├── components/       ui/ (primitives), table/ (DataTable), fields/, dialog/, filters/, shared/
├── hooks/            use-list-search, use-delete-dialog, use-list-export, use-excel-export ...
├── api/              privateApi / publicApi, interceptors, error parsing, token refresh
├── constants/        api.ts (endpoints), query-keys.ts (qk), permissions.ts (PERMS)
├── types/api/        backend contract types (DTOs); types/routes.ts (paths from the route tree)
├── lib/ utils/ store/ services/ guards/ validations/ context/ locales/ style/
├── mocks/            core.ts helpers, seed/, handlers/ (one per feature), index.ts
└── test/             setup, render, render-app (real route tree), MSW server, fixtures
e2e/                  Playwright specs; mockApi.backend() serves src/mocks
scripts/              tokens, icons, i18n validation, route generation, boundary probe
```

A feature (`suppliers/` is the reference: copy it):

```text
index.tsx                      list container: JSX + one useXListPage() call
hooks/use-list-page.ts         columns, dialog state, delete, export
hooks/filter/use-x-filters.ts  the route's search + useListSearch (page, sort, filters)
hooks/form/use-x-form-dialog.ts  dialog union (closed | create | edit(id)), form, 422 field errors
hooks/query/                   xListQueryOptions, xDetailQueryOptions, mutations
hooks/x-actions.ts             pure getXRowActions(row, { can, ... })
components/                    x-columns.tsx, x-filter-bar.tsx, dialog/x-form-dialog.tsx
services/x.service.ts          fetchX(params, { signal }), toXListQuery, create/update/delete
types/ validations/ utils/     types, search.ts + validations.ts, list-params.ts, export columns
locales/{ar,en}.json           one top-level camelCase namespace
```

## Add an entity (details and the exact lines: STRUCTURE.md)

Copy `src/features/dashboard/suppliers/` and rename it, then touch these 11 files
(`customers` as the example):

1. `src/types/api/customers.ts` (DTOs)
2. `src/constants/api.ts` (endpoints)
3. `src/constants/query-keys.ts` (`qk.customers`)
4. `src/constants/permissions.ts` (`PERMS.customer`)
5. `src/routes/_app/customers/index.tsx` (guard, `validateSearch`, loader)
6. `src/layout/dashboard/sidebar/config/nav-config.ts` (the `to` is checked against the route tree)
7. `src/locales/ar.json` and 8. `en.json` (`nav.customers`)
8. `PERMISSIONS.md` (a row; `route-guards.test.ts` fails without it)
9. `src/mocks/handlers/customers.ts` (+ seed) and 11. `src/mocks/index.ts`

Then `npm run fix` (route tree, lint fix, format), `npx vitest run src/constants -u` (the
PERMS snapshot pins the list on purpose) and `npm run check`.

## Commands

```sh
npm run dev               # Vite on :3000, mock data on (any user and password)
npm run typecheck         # tsc --noEmit
npm run lint:check        # oxlint --deny-warnings (npm run lint fixes)
npm run lint:probe        # proves the layer-boundary rule fires (also in check)
npm run fmt:check         # oxfmt (npm run fmt writes)
npm run test              # vitest run + the isolated pass (resetModules files); one file: npx vitest run <path>
npm run test:e2e          # Playwright, 4 projects (ar/en x light/dark) + axe
npm run routes            # regenerate src/routeTree.gen.ts without Vite
npm run fix               # routes + lint fix + format
npm run tokens            # regenerate theme.css / preset.css from src/style/tokens
npm run i18n:validate     # same keys in ar and en
npm run check             # typecheck + lint + probe + format + test
npm run build             # last
```

Note: oxlint skips a folder that a parent `.gitignore` hides, so run `lint:check` from
inside your own repository.

## Conventions

- kebab-case files, `index.tsx` for every container, no barrels. A file lives in
  the deepest folder that contains every importer; move it to `src/` when a
  second feature needs it.
- Containers render, hooks think. Comments explain why, never what.
- Every async UI state handles loading, error and empty. API errors are toasted by
  the client; validation errors show under the field.
- Conventional commits (`fix(suppliers): ...`); never `--no-verify`.
