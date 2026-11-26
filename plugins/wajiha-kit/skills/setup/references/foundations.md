# Foundations: what each one is and where its demo content lives

The three folders under `${CLAUDE_PLUGIN_ROOT}/starters/` are verified projects (typecheck, lint, tests and build pass).
Stack, structure and tooling are fixed. Only the content changes: pages, entities, copy, languages, colours, name.
Every one ships its own `CLAUDE.md`, `.claude/rules/*.md` and an Arabic `STRUCTURE.md` with the recipes. Read the
foundation's `CLAUDE.md` and `STRUCTURE.md` before editing: they are the authority; this file only maps them.
Everything below was checked against the folders (paths, scripts, ports). A path that is missing in the copy means the
foundation changed: trust the copy, tell the user.

| | dashboard | website | fullstack (site + admin) |
| --- | --- | --- | --- |
| Folder | `starters/dashboard` | `starters/website` | `starters/fullstack` |
| `profile` in `wajiha-kit.json` | `dashboard` | `website` | `fullstack` |
| Framework | Vite SPA, TanStack Router | TanStack Start (SSR) | TanStack Start; admin is client-only |
| Node | >= 22.18 | >= 24 (`.npmrc` engine-strict) | >= 24 (`.npmrc` engine-strict) |
| `devPort` / `e2ePort` | 3000 / 3100 | 5190 / 5191 | 5190 / 5191 |
| `apiBaseEnv` | `VITE_API_BASE_URL` | empty (no API; `CONTACT_WEBHOOK_URL` is a webhook) | `VITE_ADMIN_API_URL` |
| `generatedPaths` | `src/routeTree.gen.ts`, `src/style/theme.css`, `src/style/preset.css` | `src/routeTree.gen.ts` | `src/routeTree.gen.ts`, `src/style/theme.css`, `src/style/preset.css` |
| Tokens (colours, fonts) | `src/style/tokens/` then `npm run tokens` | `src/shared/style/tokens.css` (hand-written) | `src/style/tokens/` then `npm run tokens` |
| Languages list | `src/lib/i18n/languages.ts` | `src/shared/lib/i18n/languages.ts` | `src/shared/lib/i18n/languages.ts` |
| Mock backend | `src/mocks/` (MSW), on by `VITE_USE_MOCK="true"` in the committed `.env.development` | none | `src/features/admin/mocks/`, on in `npm run dev` |
| Own recipes | CLAUDE.md "Add an entity"; STRUCTURE.md "إضافة كيان جديد" | STRUCTURE.md "كيف تضيف صفحة", "كيف تضيف نصاً", "كيف تضيف حقلاً لفورم التواصل" | CLAUDE.md "Add a public page", "Add an admin entity"; STRUCTURE.md "كيف تضيف صفحة للموقع", "كيف تضيف كياناً للإدارة" |
| Reference entity or page | `src/features/dashboard/suppliers/` | `src/features/website/about/` (page), `contact/` (form) | `src/features/admin/suppliers/`, `src/features/site/about/` |

Scripts that exist in all three: `dev build typecheck lint lint:check fmt fmt:check test test:e2e e2e:install i18n:validate check check:full`.
Dashboard also: `routes tokens icons fix lint:probe test:isolated`. Website and fullstack also: `check:env check:css check:tooling check:bundle setup:env audit`;
fullstack also `tokens check:boundaries dev:api`. The done check is `npm run check` (then `npm run build`).

## Copy (the same for all three)

Copy everything from the starter, demo content included: the foundation's recipes start from the reference entity or page,
so strip the demo only after the first real one exists (`new-project-flow.md`, step 7).

Leave out: `node_modules`, `.output`, `.nitro`, `.tanstack`, `dist`, `coverage`, `playwright-report`, `test-results`,
`blob-report`, `.lint-probe`, `*.tsbuildinfo`, `.env`, `.env.local`, `.env.*.local`, `.git`. Keep `package-lock.json`
(the verified versions; `npm install` honours it and only renames it) and the committed `.env.example`
(dashboard also `.env.development`).

## Where the demo lives (strip these, in this order)

The sweep that proves it is gone is in `new-project-flow.md` (step 7). The demo words are: warehouse, supplier,
categor(y/ies), unit of measure / uom, attribute, inventory, stock, "Example Company", "شركة المثال", "Example".
`example.com` in CI files, the Dockerfile comments and env tests is a placeholder host, not demo content: leave it.

### dashboard

- Features (delete after the user's entities exist): `src/features/dashboard/{warehouses,suppliers,categories,units-of-measure}/`
  (categories holds `pages/attributes/`). `home/` is rewritten, not deleted. `src/features/dashboard/README.md` describes the demo: rewrite or delete.
- Routes: `src/routes/_app/{warehouses,suppliers,categories,attributes,units-of-measure}/`; `src/routes/_app/index.tsx` (home) is rewritten.
- Registries (edit, do not delete): `src/constants/{api,query-keys,permissions,audit-entities,enums}.ts` and their tests
  (`permissions.test.ts` is a snapshot: `npx vitest run src/constants -u` after the edit), `src/layout/dashboard/sidebar/config/nav-config.ts`
  (icons come from `src/lib/icons.tsx`), `src/locales/{ar,en}.json` (`nav.*`), `PERMISSIONS.md` (`route-guards.test.ts` fails without a row per page).
- Types: `src/types/api/{suppliers,warehouses,catalog,overview}.ts`, the audit and entity enums in `enums.ts`.
- Mock backend: `src/mocks/handlers/{suppliers,warehouses,categories,attributes,units,overview,search}.ts`,
  `src/mocks/seed/{suppliers,warehouses,categories,units,activity,misc,notifications,people}.ts`, then `src/mocks/index.ts`.
  Keep `core.ts`, `browser.ts`, `handlers/{auth,shell}.ts`, `seed/base.ts`. Search (`handlers/search.ts`, `layout/dashboard/topbar/utils/search-options.ts`),
  notifications (`notification-target.ts`) and the home widgets name the demo entities: rewrite them for the user's entities or remove what has no counterpart.
- Tests and e2e: delete `e2e/{suppliers,warehouses,categories,units-of-measure}.spec.ts` and `e2e/a11y-pages/{suppliers,warehouses,categories,units-of-measure}.ts`; rewrite what the sweep finds in
  `e2e/{home,global-search,notifications,sidebar-nav,guards,login,branding}.spec.ts`, `e2e/global-setup.ts`, `e2e/fixtures/home.ts`, `e2e/a11y-pages/home.ts`, `src/test/msw/handlers.ts`, `*-test-utils.ts` in the deleted features.
  Shared tests (`src/components/**`, `src/store/permission-store.test.ts`, ...) use the demo words as sample data: rename the word to the user's entity
  (whole-word replace), then run the tests.
- Name and brand: `package.json` `name`, `index.html` `<title>`, `vite/pwa.ts` (`name`, `short_name`, `description`), `src/locales/{ar,en}.json`
  `shell.brand.{title,subtitle}` and `shell.sidebar.title`, the tests that assert the Arabic brand `لوحة التحكم`
  (`e2e/branding.spec.ts`, `src/layout/auth/components/auth-brand-panel.test.tsx`, `src/layout/auth/index.test.tsx`), `README.md` (rewrite short), `STRUCTURE.md` title.
- `STRUCTURE.md` sections that describe the demo (`الصفحات الخمس`, `الداتا التجريبية` counts, `وش تغيّر عن الـplayground القديم`, `حالة الفحوصات`): delete them; keep the structural sections.

### website

- Pages: `src/features/website/{home,about,services,news}/` (news has `data/articles.ts`, `data/locales`, `pages/`); keep `contact/` (a real form with server delivery) and `fallback/`.
  Routes: `src/routes/$locale/{index,about,services,contact}.tsx`, `news/{index,$slug}.tsx`.
- Registries: `src/config/nav.config.ts` (one `navItem` per page; also drives header, footer, sitemap), `src/shared/lib/i18n/resources.ts` (each page's two locale files),
  `src/shared/locales/{ar,en}.json` (`nav.*`, footer), `e2e/fixtures/app.ts` (`PAGES`, `ARTICLE` come from the first article: drop both with the news pages).
- Company facts: `src/config/site.config.ts` (names, email, phone, `themeColor`), `public/{favicon.svg,og-default.png,site.webmanifest}`,
  `public/images/news-*.svg`; regenerate the share image with `node scripts/generate-og-image.mjs` (or the user's 1200x630 PNG).
- Tests naming the demo company: `src/shared/lib/seo/{jsonld,seo}.test.ts`, `e2e/ui/contact.spec.ts`, contact tests: update the expected name.
- Env: `.env.example` is the only env file; `npm run setup:env` copies it to `.env.local` (the user runs it: Claude cannot write `.env*`).
  A verification build without that file: `VITE_SITE_URL=http://localhost:5190 VITE_ALLOW_INDEXING=false npm run build` (the values CI uses).
- Name: `package.json` `name`, `public/site.webmanifest`, `Dockerfile` comment lines, `STRUCTURE.md` title and the section `استبدال الشركة التجريبية بشركتك` (delete once done).

### fullstack

- Site: same as website but under `src/features/site/{home,about,services,news}/`, routes `src/routes/$locale/`, nav in `src/features/site/config/nav.config.ts`,
  locale registration in `src/features/site/i18n/resources.ts`, `e2e/fixtures/app.ts`, `src/config/site.config.ts`, `public/*`.
- Admin: `src/features/admin/suppliers/` (reference entity), `overview/` (stat cards; rewrite for the user's entities), `settings/` (profile form: keep),
  route `src/routes/$locale_/admin/_shell/suppliers.tsx`, nav `src/features/admin/layout/nav-config.ts` plus `admin.nav*` labels in `src/features/admin/locales/{ar,en}.json`,
  `types/api.ts`, `api/endpoints.ts`, `api/query-keys.ts`, `constants/permissions.ts`, mock API `mocks/{suppliers,seed,db,handlers}.ts`, e2e `e2e/ui/admin*.spec.ts`.
  Keep `auth/`, `api/` core, `store/`, `guards/`, `layout/`, `mocks/{http,crud,start-mocks,browser}.ts`.
- Mock users in dev: any name = admin, `viewer` = read only, `expired`, `blocked` (`STRUCTURE.md`); keep them, they are how the 401/403 paths are tested.
- Name: `package.json` `name`, `public/site.webmanifest`, `Dockerfile` comments, `STRUCTURE.md` title and `استبدال الشركة التجريبية بشركتك`.

## `.claude/settings.json` and `wajiha-kit.json` for a foundation

Settings: `templates/<profile>/settings.json` with `{{DEFAULT_BRANCH}}` = `main`, the ports above, `{{LIVE_HOST}}` empty (so drop `sandbox.network.deniedDomains`).
It already denies the other app's skills (dashboard denies `web-*`, website denies `dash-*`, fullstack denies none). Add to `allow` the foundation's own scripts:
`npm run fmt`, `npm run lint`, and dashboard `routes tokens fix lint:probe`, website `check:env check:css check:tooling check:bundle`, fullstack `tokens check:boundaries check:env check:css check:tooling check:bundle`;
add `Edit(./src/style/theme.css)` and `Edit(./src/style/preset.css)` to `deny` for dashboard and fullstack.

`.claude/wajiha-kit.json` (one Write call): start from `templates/<profile>/wajiha-kit.json` and set
`mode` `new`, `projectName`, `projectDescription` (the user's, one line), `liveHosts` `[]`, `uatHost` `""`, `githubRepo` `""` (until a remote exists), `defaultBranch` `main`,
`protectedBranches` `["main","master"]`, the ports and `apiBaseEnv` from the table, `protectedPaths` `[".env",".env.*",".github/**","deploy/**","package-lock.json"]`
(no `server/**`: the starters have no root `server/` folder), `generatedPaths` from the table, `srcDirs` `["src"]`, `srcDir` `"src"`, and
`commands` `{"typecheck":"npm run typecheck","lint":"npm run lint:check","test":"npm run test","build":"npm run build","dev":"npm run dev","relatedTests":"npx vitest related --run --passWithNoTests","i18nValidate":"npm run i18n:validate"}`,
and `stack` `{"packageManager":"npm","framework":"Vite" | "TanStack Start","router":"TanStack Router","data":"TanStack Query","state":"Zustand","styling":"Tailwind","tests":"vitest","e2e":"playwright","lint":"oxlint","format":"oxfmt","i18n":"i18next","forms":"react-hook-form","typescript":true}`.
Fullstack also keeps the template's `apps`: site `{"name":"site","profile":"website","path":"src","routes":"src/routes/$locale"}`, admin
`{"name":"admin","profile":"dashboard","path":"src/features/admin","routes":"src/routes/$locale_/admin","apiBaseEnv":"VITE_ADMIN_API_URL"}`;
leave both apps' `commands` out (one `npm run i18n:validate` and one test run cover both; the project commands are used).
The foundation's own `CLAUDE.md` and `.claude/rules/` stay as copied: the kit's template rules are not copied on top (they overlap). Only `templates/shared/rules/git.md`
is added to `.claude/rules/` (placeholders: `{{DEFAULT_BRANCH}}` `main`, `{{PROTECTED_BRANCHES}}` `main, master`, `{{GITHUB_REPO}}` empty: write the compare-link line without a repo until one exists).
