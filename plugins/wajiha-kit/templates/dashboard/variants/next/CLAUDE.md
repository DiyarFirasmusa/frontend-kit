# CLAUDE.md — {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

An admin dashboard: signed-in staff list, filter, create, edit and delete
records behind permission checks. Arabic default (RTL), English LTR.

Stack: Next.js (App Router, a client-rendered admin: `'use client'` containers), React 19,
TypeScript (strict), URL search params parsed by zod (`routing.md`), TanStack Query 5, TanStack Table, Zustand 5 (client state
only), axios, react-hook-form + zod 4, base-ui / shadcn-style primitives,
Tailwind CSS v4 tokens, i18next, sonner, Sentry. Tests: Vitest + Testing
Library + MSW, Playwright + axe. The project's linter and formatter, husky + lint-staged +
commitlint. Package manager: **npm**.

The bar every change meets: `.claude/rules/quality-bar.md`. Area rules: `.claude/rules/`
(loaded on read or edit of a matching file, not on search).

## Hard rules

- Every file under `src/` is `.ts` / `.tsx`. No `any`, no `@ts-ignore` /
  `@ts-expect-error`, no `as` to silence the compiler. Use `unknown` and narrow.
- Pages are thin and default-exported; every container is `'use client'`. `next-env.d.ts` and `.next/` are generated:
  never edit them. Guards live in the group layouts and pages (`routing.md`); `src/proxy.ts` is only an optional cookie check.
- The admin is never indexed (`robots` metadata `noindex`, not disallowed in robots.txt). Secrets have no `NEXT_PUBLIC_` prefix.
- The URL owns a list's page, page size, sort and filters (`routing.md`); the
  Query cache owns server data. Neither is copied into `useState` or Zustand.
- Every route behind login has a permission guard and every action checks its
  permission (`permissions.md`); the backend still decides.
- Only the API clients toast API results and handle 401 (`api-layer.md`).
- A submit or a destructive action is single-flight; delete asks to confirm first.
- No hardcoded user-facing strings: every string goes in both `ar` and `en`.
- No PII in Sentry or logs (`error-monitoring.md`).
- Never test against the live site ({{LIVE_HOST}}). Use MSW, local mocks or UAT ({{UAT_HOST}}).
- Never touch deploy config (`.github/`, `deploy/`, `server/`, the `build` script).
- One branch per task from `origin/{{DEFAULT_BRANCH}}`. Ask before every commit
  and push. Never open or merge a PR, never push to {{PROTECTED_BRANCHES}}.

## Commands

```sh
npm run dev               # next dev on :{{DEV_PORT}}
npm run typecheck         # next typegen && tsc --noEmit
npm run lint:check        # the project's linter, ESLint by default (npm run lint fixes)
npm run fmt:check         # the project's formatter (npm run fmt writes)
npm run test              # vitest run; one file: npx vitest run <path>
npm run i18n:validate     # when translations changed
npm run test:e2e          # Playwright on :{{E2E_PORT}}; when a route, flow or layout changed
npm run build             # next build; last
npm run check             # typecheck + lint:check + test
```

## Folder layout (an example: `project.md` and existing code win)

Full tree, path map and ownership rules: `.claude/rules/structure.md`.

```text
src/
├── app/                  → App Router, thin: page.tsx = default export rendering one container
│   ├── layout.tsx        → html lang/dir, <Providers>; no auth here
│   ├── (auth)/           → guest-only (login, forgot password); layout redirects a signed-in user
│   ├── (app)/            → signed-in shell (session gate) + loading.tsx; every page checks a permission
│   ├── (errors)/         → 401 / 403 / 500; not-found.tsx, error.tsx, global-error.tsx at the root
│   └── api/              → route handlers, only for same-origin glue (rare); no robots Disallow (it hides noindex)
├── proxy.ts              → optimistic cookie check + redirect to /login (not the permission check)
├── features/<group>/<entity>/   → one folder per backend resource; <group> = the route group or product area
├── layouts/              → one shell per route group: dashboard/{header,sidebar,components}, auth/
├── components/           → ui/ table/ filters/ fields/ wrappers/ (loading·error·empty) modals/ cards/
├── api/                  → client/ (privateApi, publicApi, interceptors), errors/ (error resolution)
├── contexts/  config/  i18n/   → providers (query…); static policy (nav → permission); i18n setup + switcher
├── constants/            → api.ts (endpoints), query-keys.ts (qk), permissions.ts (PERMS)
├── guards/               → <RequireAuth> / <RequireGuest> / <RequirePermission> and the pure checks
├── hooks/  store/  lib/  types/  utils/  locales/  styles/  test/
└── env.ts                → zod-validated env (NEXT_PUBLIC_* for the browser)
```

A feature folder: `index.tsx` (list container, one `useListPage()`), `components/`, `hooks/` (`query/`, `filter/`,
`form/`), `services/<entity>.service.ts`, `types/`, `validations/`, `locales/{ar,en}.json`, `pages/<page>/` (detail,
create, edit: each owns its own hooks, components, services…), `tabs/<tab>/`, `steps/<step>/`.

- **Containers render, hooks think.** `index.tsx` is JSX plus one page hook.
- **A file lives in the deepest folder that contains every importer.** Promote
  to `src/` on the second feature, never before. A page never imports a sibling page.
- **Imports go up, never sideways.** Relative inside a feature, `@/…` across.
- kebab-case files, `index.tsx` for every container, no barrels.

## API layer (full rules: `api-layer.md`)

- `privateApi` (Bearer, single-flight refresh on 401 + one retry) and
  `publicApi` (no token) in `src/api/client/`. Base URL from `{{API_BASE_ENV}}`.
- The interceptors unwrap the response envelope (when the backend has one) and
  toast every mutation success and every error, in one place.
- Endpoints in `constants/api.ts`, keys from `qk` in `constants/query-keys.ts`.
- Mirror the backend's OpenAPI exactly: field names, paging shape, enums,
  nullables. Missing or wrong backend behaviour gets reported, not faked.

## Task delivery

- Implement directly: `task` for a new task, `dash-create-route` / `-table` /
  `-crud` / `-filter-bar` / `-detail` / `-settings-form`, `verify` before saying done,
  `review` before asking to commit a non-trivial change. Long runs: keep a todo list until done or truly blocked.

## Branches and environments

- Task branches come from `origin/{{DEFAULT_BRANCH}}`; the user opens PRs from
  `https://github.com/{{GITHUB_REPO}}/compare/{{DEFAULT_BRANCH}}...<branch>?expand=1`.
- Conventional commits (`fix(users): …`), never `--no-verify`.

## How the user talks (short, mixed languages, typos: read intent, not spelling)

| They write                         | They mean                                                         |
| ---------------------------------- | ----------------------------------------------------------------- |
| `commit`, `commit push`, `yes`     | Approval to commit **and** push the task branch (`commit-push`)   |
| `continue`                         | Resume the last unfinished step; don't restart or re-ask          |
| `all`, `check all`, `other pages`  | Every occurrence, proven by a final grep (`fix-everywhere`)       |
| `link`, `link pr`                  | Print the compare link + PR description (`pr-link`)               |
| `why …?`, `explain`                | Answer only, no edits (`explain`)                                 |
| `fast`                             | Shortest correct path; the gates still run                        |
| a Figma link                       | Match it exactly (`figma-match`)                                  |

## Conventions

- Logical CSS properties only (`rtl.md`). Every async UI state handles loading,
  error and empty; API errors are toasted by the client, validation errors
  show inline on the field.
- Comments explain why, never what. Files stay under 500 lines. Every task
  ships with tests (`testing.md`).

## Glossary

| Term        | Meaning                                            |
| ----------- | -------------------------------------------------- |
| Entity      | One backend resource with its own feature folder   |
| Row action  | An action on one table row (view, edit, delete)    |
| Bulk action | An action on the selected rows of the current page |
| UAT         | {{UAT_HOST}}, the test environment                 |
