# CLAUDE.md — {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

One project, two apps in one TanStack Start tree: a public **site** and an **admin** dashboard under `{{ADMIN_PATH}}`.
They share the toolchain and the root files only; their code, rules and checks are separate.
The bar every change meets: `.claude/rules/quality-bar.md`. Area rules load when a matching file is read or edited, not searched.

| App   | Profile   | Code                                              | Routes                  | Rendering                    |
| ----- | --------- | ------------------------------------------------- | ----------------------- | ---------------------------- |
| site  | website   | `src/features`, `src/shared`                      | `{{SITE_ROUTES}}`       | SSR, SEO, public             |
| admin | dashboard | `{{ADMIN_DIR}}`                                   | `{{ADMIN_ROUTES}}`      | `ssr: false`, `noindex`, auth |

Which app is a file in? The longest `path` in `.claude/frontend-kit.json` → `apps`. The hooks, the rules and the skills
follow that answer: `web-*` skills and the `site` rules for the site, `dash-*` skills and the `admin-*` rules for the admin.

## Hard rules

- **Never import across apps.** `{{ADMIN_DIR}}/**` and `src/features|shared/**` do not import each other. Code both need
  goes in `src/common/` (pure functions and types only: no providers, no stores, no components with state).
- **Two providers, two instances.** The site makes one QueryClient and one i18n instance per request. The admin owns its
  own QueryClient, i18n instance, Toaster and auth store inside its layout route; the layout overrides the router context.
- **Every route path under the admin starts with `{{ADMIN_PATH}}`** (links, `navigate`, redirects, tests). `tsc` cannot
  catch a missed prefix when the same path exists on the site (`/login`, `/`): grep for it.
- The admin is never indexed: `noindex` header and meta. Not disallowed in robots.txt, which would hide the `noindex`.
- Module top-level code in the admin must be SSR-safe (no `window` outside effects), the server bundle still imports it.
- One theme file; admin-only token values live under `:root[data-app='admin']`. Never hardcode a colour.
- `<html lang dir>` and the dark class have one owner each: the site's root; the admin restores them when it unmounts.
- Env names differ per app (`apiBaseEnv` per app in the config); never reuse one name with two meanings.
- TypeScript strict: no `any`, no `@ts-ignore`, no `as` to silence the compiler. No hardcoded user-facing strings.
- Never test against the live site ({{LIVE_HOST}}). Use MSW, local mocks or UAT ({{UAT_HOST}}).
- Never touch deploy config (`.github/`, `deploy/`, `server/`, the `build` script) or generated files.
- One branch per task from `origin/{{DEFAULT_BRANCH}}`. Ask before every commit and push. Never open or merge a PR,
  never push to {{PROTECTED_BRANCHES}}.

## Commands

```sh
{{PM_RUN}} dev            # one dev server on :{{DEV_PORT}} serves both apps
{{PM_RUN}} typecheck      # whole project
{{PM_RUN}} lint:check
{{PM_RUN}} test           # unit tests: one project per app (vitest test.projects)
{{PM_RUN}} i18n:validate  # runs the site validator and the admin validator
{{PM_RUN}} build          # last
```

The gate runs each app's own related-tests and i18n commands on its own files (`apps[].commands`).

## Folder layout

```text
src/
├── routes/
│   ├── __root.tsx        → site root (document, providers); shared by both apps
│   ├── _site/ _site.tsx  → the site's routes and layout
│   └── admin/ admin.tsx  → the admin's routes; admin.tsx = layout (ssr:false, guard, providers)
├── features/  shared/    → the SITE (feature folders, server functions, SEO, queries)
├── admin/                → the ADMIN (api, components, features, guards, hooks, layout, lib, locales, services, store…)
├── common/               → pure code both apps use (optional)
└── router.tsx  routeTree.gen.ts   → shared; the route tree is generated, never edited
```

Inside each app the layout rules of its profile apply (`website`: feature folders under `src/features`;
`dashboard`: one folder per backend resource under `{{ADMIN_DIR}}/features`).

## Task delivery

- Say which app a task is for before starting; a new route goes under that app's routes folder.
- Implement directly: `task`, `web-create-route` / `-feature` / `-server-fn` / `-seo-page` for the site,
  `dash-create-route` / `-table` / `-crud` / `-filter-bar` / `-detail` / `-settings-form` for the admin,
  `verify` before saying done, `review` before asking to commit a non-trivial change.
- Refactor mode: `/frontend-kit:refactor-mode` restructures one app at a time.

## Branches and environments

- Task branches come from `origin/{{DEFAULT_BRANCH}}`; the user opens PRs from
  `https://github.com/{{GITHUB_REPO}}/compare/{{DEFAULT_BRANCH}}...<branch>?expand=1`.
- Conventional commits (`fix(admin-users): …`), no AI attribution, never `--no-verify`.

## How the user talks (short, mixed languages, typos: read intent, not spelling)

| They write                        | They mean                                                       |
| --------------------------------- | --------------------------------------------------------------- |
| `commit`, `commit push`, `yes`    | Approval to commit **and** push the task branch (`commit-push`) |
| `continue`                        | Resume the last unfinished step; don't restart or re-ask        |
| `all`, `check all`, `other pages` | Every occurrence in the right app, proven by grep               |
| `link`, `link pr`                 | Print the compare link + PR description (`pr-link`)             |
| `why …?`, `explain`               | Answer only, no edits (`explain`)                               |
| a Figma link                      | Match it exactly (`figma-match`)                                |

## Conventions

- Logical CSS properties only (`rtl.md`). Every async UI state handles loading, error and empty.
- Comments explain why, never what. Files stay under 500 lines. Every task ships with tests (`testing.md`).
