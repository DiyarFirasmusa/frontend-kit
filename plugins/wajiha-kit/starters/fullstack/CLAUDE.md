# CLAUDE.md

A public website and an admin dashboard in one TanStack Start project. Arabic (RTL) is the default language,
English (LTR) is equal. The public site is server-rendered; the admin lives at `/{lang}/admin`, renders in the
browser only (`ssr: false`), is never indexed, and talks to an API (a mock API inside the browser until you
connect a backend). The long guide for people is `STRUCTURE.md` (Arabic). This file is the short version for you.

Stack: React 19, TanStack Start + Router (file routes), TypeScript strict, Tailwind v4 with one token system,
Base UI, TanStack Query 5 (admin only), Zustand, react-hook-form + zod 4, i18next (one instance, in the router
context), axios (admin API only), MSW (the mock API). Tests: Vitest + Testing Library, Playwright + axe.
oxlint, oxfmt, husky, commitlint. Package manager: npm. Node 24+.

Rules live in `.claude/rules/` and load by path: `routing`, `api-layer`, `i18n-rtl`, `styles-tokens`,
`permissions`, `testing`.

## Hard rules

- `src/features/site` and `src/features/admin` never import each other. `src/components`, `src/shared`,
  `src/style`, `src/config` never import a feature or a route. Shared code goes down into `components`
  (UI) or `shared` (no UI). Lint enforces it for `@/` and for relative paths; `npm run check:boundaries` proves it.
- `axios` only inside `src/features/admin/api`. No default import of `i18next`: use `useTranslation`.
- Admin code must not reach the public pages. `src/routes/$locale_/admin.tsx` and the other admin route files
  are in the public entry chunk: import admin code there only through `import()` or the route's split
  properties (`component`, `notFoundComponent`). `npm run check:bundle` fails on a leak or a size regression.
- Admin pages: URL starts `/{lang}/admin`; links use `to="/$locale/admin/..."` with `params={{ locale }}`.
  Never add an admin route to the public `NAV` (it does not compile). The admin stays `noindex`, out of
  `sitemap.xml`, and not `Disallow`ed in `robots.txt`.
- No user-facing string in code: `t('group.key')`, both `ar` and `en` in the same change.
- Logical CSS only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`): no `ml-`, `mr-`, `left`, `right`.
- No hardcoded colours or spacings: token utilities only (`bg-surface`, `text-text-primary`, ...).
- The CSP is strict (`style-src 'self'`, no inline script without a nonce, no eval): no style-injecting
  libraries, no inline `style=` for layout, no third-party script without an entry in `THIRD_PARTY`
  (`src/shared/server/security-headers.ts`). `VITE_*` values reach the browser: never a secret.
- No `any`, no `@ts-ignore`, no `!`, no `console.log`, files under 400 lines. Every async view handles
  loading, error and empty. A submit is single-flight.
- Never edit: `src/routeTree.gen.ts`, `src/style/theme.css`, `src/style/preset.css` (generated), `.env*`,
  `.github/`, `deploy/`, `public/mockServiceWorker.js`.
- Ask before every commit and push. Conventional commits (commitlint). One branch per task.

## Commands

```text
npm run dev               # :5190, admin on the MOCK API (any login; see "Mock API users")
npm run dev:api           # :5190, admin on the real API from .env.local (VITE_ADMIN_API_MOCK=false)
npm run typecheck | lint:check | fmt (writes) | fmt:check | i18n:validate | test
npm run tokens            # regenerate src/style/theme.css and preset.css from src/style/tokens
npm run check             # everything above plus env, css, tooling, boundaries, unit tests
npm run build             # then: npm run check:bundle  (public pages size budget + no admin code)
npm run test:e2e          # builds, serves the production build on :5191 (E2E_PORT=5441 to change), Playwright
npm run check:full        # check + build + check:bundle + test:e2e
```

One test file: `npx vitest run path/to/file.test.tsx`. One e2e project: `npx playwright test --project=en-desktop`.
After adding a route file run `npm run dev` or `npm run build` once: it regenerates `src/routeTree.gen.ts`.
After renaming or generating files run `npm run fmt`.

## Folder map

```text
src/routes/            thin route files: path, search validation, guards, head(), the component import
  __root.tsx           <html lang dir>, CSS, fonts, robots meta (noindex for the admin and failed pages)
  $locale.tsx $locale/ the public site (/ar, /en ...)  with the site header and footer
  $locale_/admin.tsx   the admin layout route (ssr: false), $locale_/admin/{login,_shell/*}
src/features/site/     the public site: <page>/{index.tsx,<page>-head.ts,locales/}, layout, config/nav.config.ts, i18n/resources.ts
src/features/admin/    the admin: <feature>/{index.tsx,use-<x>-page.ts,<x>.service.ts,use-<x>-queries.ts,validations.ts,locales/}
  api/ store/ guards/ layout/ constants/permissions.ts mocks/ i18n/ types/api.ts components/can.tsx locales/
src/components/        shared UI: ui/ (primitives), table/, dialog/, fields/, common/, locales/
src/shared/            shared code with no UI: env, i18n, seo, server (headers), store, hooks, utils
src/style/             tokens/*.ts (source) -> theme.css, preset.css (generated); styles.css; component css
src/test/              setup, MSW server, render helpers     e2e/  raw/ (server answers)  ui/ (browser)
```

## Add a public page

`src/features/site/<page>/` with `index.tsx`, `<page>-head.ts` (copy `about/about-head.ts`) and `locales/{ar,en}.json`;
register both locale files in `src/features/site/i18n/resources.ts`; add `src/routes/$locale/<page>.tsx`; run
`npm run dev` once; for the menu, footer and sitemap add one `navItem` line in `nav.config.ts` and a `nav.<page>`
key in `src/shared/locales/`; add the page to `PAGES` in `e2e/fixtures/app.ts`.

## Add an admin entity

Copy `src/features/admin/suppliers/` to `<entity>/` and rename. Then: types in `types/api.ts`, paths in
`api/endpoints.ts`, keys in `api/query-keys.ts`, permissions in `constants/permissions.ts`, a route file
`src/routes/$locale_/admin/_shell/<entity>.tsx` (copy `suppliers.tsx`), one line in `layout/nav-config.ts` plus the
`admin.nav<Entity>` label in `features/admin/locales/{ar,en}.json`, mock data and handlers in `mocks/`
(`seed.ts`, `db.ts`, `handlers.ts`), tests. Locale files are picked up by folder (no registration). The full
step list with the order and the traps is in `STRUCTURE.md`.

## Mock API users (`npm run dev` and e2e)

Any name signs in as administrator. `viewer`: read only, every change answers 403. `expired`: signs in, then
every request answers 401. `blocked`: the login answers 401. The mock enforces permissions like a backend.

## Conventions

- Language is the URL prefix. The router context holds one i18n instance per request; the admin adds its
  texts lazily (`loadAdminI18n`). Texts every admin URL needs before that (not found, errors) live in `src/shared/locales`.
- Every admin page sets `head: adminHead('<feature>.title')`. The page has one `<h1>`; `#admin-main` is the `<main>`.
- List state (search, filter, page) lives in the URL and is validated in the route (`validateSearch`).
- Errors from the API are toasted once by the API layer; a caller that shows the error itself passes
  `silentError: true`. A success toast is `successMessage: '<key>'` on the request.
- Commit messages: `type(scope): subject`. Definition of done: `npm run check` (+ `npm run test:e2e` when a
  route or UI changed).
