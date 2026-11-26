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
`blob-report`, `.lint-probe`, `*.tsbuildinfo`, `.env`, `*.local` (covers `.env.local` and `.env.*.local`; the copy command in `new-project-flow.md` never names them), `.git`. Keep `package-lock.json`
(the verified versions; `npm install` honours it and only renames it) and the committed `.env.example`
(dashboard also `.env.development`).

## Where the demo lives (strip these, in this order)

The sweep that proves it is gone is in `new-project-flow.md` (step 7). The demo words are: warehouse, supplier,
categor(y/ies), unit(s) of measure (also spelled `units-of-measure`) / uom, attribute definition / data type, inventory, stock, storekeeper, "Example Company", "شركة المثال", "Example",
the word "playground" in comments, and the brand letter `authBrand.logoMark` ("D") in the locale files. The sweep pattern is exact and tested: copy it from there, do not retype it.
`example.com` in CI files, the Dockerfile comments and env tests is a placeholder host, not demo content: leave it.

### dashboard

Order: (1) the user's entities exist; (2) rewrite what is listed under "Rewrite"; (3) delete what is listed under "Delete"; (4) run the sweep and `npm run check`. Delete last: the files below import each other.

**Delete** (after the user's entities exist):

- Features: `src/features/dashboard/{warehouses,suppliers,categories,units-of-measure}/` (categories holds `pages/attributes/`).
- Routes: `src/routes/_app/{warehouses,suppliers,categories,attributes,units-of-measure}/`.
- Mock handlers: `src/mocks/handlers/{suppliers,warehouses,categories,attributes,units}.ts`. Mock seeds: `src/mocks/seed/{suppliers,warehouses,categories,units}.ts`
  (only after "Rewrite" below: `seed/misc.ts` and `seed/notifications.ts` import `seed/warehouses`, `seed/activity.ts` imports all four).
- Types: `src/types/api/{suppliers,warehouses,catalog}.ts` (only the deleted features, handlers and seeds import them).
- E2E: `e2e/{suppliers,warehouses,categories,units-of-measure}.spec.ts` and `e2e/a11y-pages/{suppliers,warehouses,categories,units-of-measure}.ts`
  (`a11y-pages/` is auto-discovered: no registry to edit).

**Rewrite for the user's entities** (do not delete; other code imports them):

- Mock backend: `src/mocks/index.ts` (the handler list), `handlers/overview.ts` and `handlers/search.ts` (they read the four demo seeds), `seed/activity.ts`, `seed/misc.ts`
  (workspace name, audit log), `seed/notifications.ts`, `seed/people.ts` (job titles, org units, the `roles` list with `INVENTORY_*`, the signed-in user `me`),
  `src/types/api/overview.ts`. Keep `core.ts` (rename the `// Warehouses` comment above `nextCode`), `handlers/{auth,shell}.ts`, `seed/base.ts`:
  `auth.ts` imports `seed/misc` and `seed/people`; `shell.ts` imports `seed/misc`, `seed/notifications`, `seed/people`. The comments that say "playground" in `src/mocks/browser.ts` and `src/main.tsx`.
- Registries and their tests: `src/constants/{api,query-keys,permissions,audit-entities,enums}.ts` (`permissions.test.ts` is a snapshot: `npx vitest run src/constants -u` after the edit),
  `src/types/api/enums.ts` (`WarehouseUserRole`, `AttributeDataType`, `AuditEntity`), `src/constants/{enums,permissions,query-keys}.test.ts`, `src/locales/locales.test.ts`,
  `src/layout/dashboard/sidebar/config/nav-config.ts` (icons from `src/lib/icons.tsx`; `sidebar-header.tsx` imports the `Warehouse` icon from there: use another), `PERMISSIONS.md` (`route-guards.test.ts` fails without a row per page).
- Home, search, notifications (the recipe is in `CLAUDE.md`, "Show the entity in search, notifications and the home page"): `src/features/dashboard/home/` (`components/home-kpi-grid.tsx`,
  `components/home-recent-changes-table.tsx`, `locales/{ar,en}.json`), `src/layout/dashboard/topbar/{types/types.ts,utils/search-options.ts,utils/notification-target.ts,hooks/use-global-search.ts,components/global-search.tsx}` and their tests.
- Tests that name the demo (the sweep finds them; replace the word with the user's entity, whole word, then run the tests): in `e2e/`: `error-pages.spec.ts` and `a11y-pages/errors.ts` (both open `/units-of-measure`),
  `home.spec.ts`, `global-search.spec.ts`, `notifications.spec.ts`, `sidebar-nav.spec.ts`, `guards.spec.ts`, `global-setup.ts`, `fixtures/app.ts`, `fixtures/home.ts`, `a11y-pages/home.ts`; in `src/`:
  `api/**/*.test.ts`, `components/{auth,dialog,fields,shared,table,ui,wrapper}/**/*.test.tsx` (and the doc comments in `components/auth/can.tsx`, `components/shared/page-header.tsx`, `components/table/data-table.tsx`),
  `features/auth/**`, `features/fallback/record-not-found.tsx` (comments), `guards/route-guards.test.ts`, `hooks/**` (`use-current-user.test.tsx`, `lookups/use-directory-search.test.tsx`, `use-excel-export.ts`),
  `layout/dashboard/sidebar/**`, `layout/dashboard/topbar/**`, `store/permission-store.test.ts`, `test/fixtures/auth.ts` (`INVENTORY_USER`), `test/msw/handlers.ts`, `utils/format.test.ts`.
  These shared tests, the e2e specs and `STRUCTURE.md` hold about 300 demo words in 60 files (the sweep after the entities exist): it is the
  largest step of the strip, so do it in bulk, one whole-word mapping per demo word (`sed -i -E 's/\bwarehouse\b/patient/g; s/\bWarehouse\b/Patient/g' $(grep -rlE '<word>' src e2e)`,
  Arabic words too), then run the tests and fix what the bulk replace broke; editing 60 files one by one runs out of budget before the end.
  Not a plain replace: `src/router.test.ts` (asserts that two warehouse routes exist: assert two routes of the user's), the sidebar tests that need two nav groups (`nav.groups`), tests that need two different entities.
- Shared words in docs: `CLAUDE.md`, `STRUCTURE.md`, `.claude/rules/*.md`, `README.md`, `src/features/dashboard/README.md` (rewrite or delete).

**Name and brand:** `package.json` `name` and `description`, `index.html` `<title>`, `vite/pwa.ts` (`name`, `short_name`, `description`), `src/locales/{ar,en}.json`:
`authBrand.{logoMark,tagline,body}` (`logoMark` is one letter, "D" in the demo: the first letter of the user's name in each language), `shell.brand.{title,subtitle}`, `shell.sidebar.title`,
`shell.roles.{WAREHOUSE_MANAGER,STOREKEEPER,STOCK_CONTROLLER,APPROVER}`, `auditLog.entities.*`, `enums.AttributeDataType`, `nav.*` (also `nav.groups`), `search.{placeholder,groups.*}`,
`errorPages.states.notFound.{alertDescription,tip1,scopeValue}`; the tests that assert the Arabic brand `لوحة التحكم`
(`e2e/branding.spec.ts`, `src/layout/auth/components/auth-brand-panel.test.tsx`, `src/layout/auth/index.test.tsx`); `README.md` (rewrite short); `STRUCTURE.md` title and the tree root `dashboard-starter/`.

**`STRUCTURE.md` sections that describe the demo** (`الصفحات الخمس`, the demo-data counts under `الداتا التجريبية`, `وش تغيّر عن الـplayground القديم`, `حالة الفحوصات`): delete them; keep the structural sections.

### website

- Pages: `src/features/website/{home,about,services,news}/` (news: `pages/`, `locales/`; its articles live in `src/content/`: `articles.data.ts`, `bodies/*.ts`,
  `articles.ts`, `sitemap-entries.ts` and their tests, also read by the home page, the sitemap and `routing*.test.ts`); keep `contact/` (a real form with server delivery) and `fallback/`.
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
- One name on both sides (a public "courses" page and a "courses" admin entity): the site and admin locale bundles share one key space, and
  `npm run i18n:validate` fails with `"courses.title" is defined in two bundles`. Give the site page its own top-level key from the start
  (`courseCatalog.*`, folder `src/features/site/course-catalog/`, URL still `/courses`) and keep `courses.*` for the admin entity.
- Mock users in dev: any name = admin, `viewer` = read only, `expired`, `blocked` (`STRUCTURE.md`); keep them, they are how the 401/403 paths are tested.
- Name: `package.json` `name`, `public/site.webmanifest`, `Dockerfile` comments, `STRUCTURE.md` title and `استبدال الشركة التجريبية بشركتك`.

## `.claude/settings.json` and `wajiha-kit.json` for a foundation

Settings: `templates/<profile>/settings.json` with `{{DEFAULT_BRANCH}}` = `main`, the ports above, `{{LIVE_HOST}}` empty (so drop `sandbox.network.deniedDomains`).
It already denies the other app's skills (dashboard denies `web-*`, website denies `dash-*`, fullstack denies none). Add to `allow` the foundation's own scripts:
dashboard `routes tokens fix lint:probe` (its template already has `fmt` and `lint`), website `fmt lint check:env check:css check:tooling check:bundle`, fullstack `fmt lint tokens check:boundaries check:env check:css check:tooling check:bundle`
(each as `Bash(npm run <name>)`; skip one the template already lists);
add `Edit(./src/style/theme.css)` and `Edit(./src/style/preset.css)` to `deny` for dashboard and fullstack. The `lsof` allow rules stay (useless on Windows, harmless).

`.claude/wajiha-kit.json` (one Write call): start from `templates/<profile>/wajiha-kit.json` and set
`mode` `new`, `projectName`, `projectDescription` (the user's, one line), `liveHosts` `[]`, `uatHost` `""`, `githubRepo` `""` (until a remote exists), `defaultBranch` `main`,
`protectedBranches` `["main","master"]`, `devPort` and `e2ePort` as JSON strings (`"3000"`, `"3100"`, like the template; the hooks compare strings) and `apiBaseEnv` from the table, `protectedPaths` `[".env",".env.*",".github/**","deploy/**","package-lock.json"]`
(no `server/**`: the starters have no root `server/` folder), `generatedPaths` from the table, `srcDirs` `["src"]`, `srcDir` `"src"`, and
`commands` `{"typecheck":"npm run typecheck","lint":"npm run lint:check","test":"npm run test","build":"npm run build","dev":"npm run dev","relatedTests":"npx vitest related --run --passWithNoTests","i18nValidate":"npm run i18n:validate"}`,
and `stack` `{"packageManager":"npm","framework":"Vite" | "TanStack Start","router":"TanStack Router","data":"TanStack Query","state":"Zustand","styling":"Tailwind","tests":"vitest","e2e":"playwright","lint":"oxlint","format":"oxfmt","i18n":"i18next","forms":"react-hook-form","typescript":true}`
(website: `"data":"none"` and `"state":"none"`: it has neither TanStack Query nor Zustand; dashboard and fullstack have both).
Fullstack also keeps the template's `apps`: site `{"name":"site","profile":"website","path":"src","routes":"src/routes/$locale"}`, admin
`{"name":"admin","profile":"dashboard","path":"src/features/admin","routes":"src/routes/$locale_/admin","apiBaseEnv":"VITE_ADMIN_API_URL"}`;
leave both apps' `commands` out (one `npm run i18n:validate` and one test run cover both; the project commands are used).
The foundation's own `CLAUDE.md` and `.claude/rules/` stay as copied: the kit's template rules are not copied on top (they overlap). Only `templates/shared/rules/git.md`
is added to `.claude/rules/` (placeholders: `{{DEFAULT_BRANCH}}` `main`, `{{PROTECTED_BRANCHES}}` `main, master`, `{{GITHUB_REPO}}` empty: write the compare-link line exactly as `https://github.com/<owner>/<repo>/compare/main...<branch>?expand=1` until a remote exists, and say in the report that `<owner>/<repo>` is for the user to fill in).

Format of `.claude/wajiha-kit.json`: write it the way `npm run fmt` would (oxfmt with the project's `printWidth: 80`): 2 spaces, a final newline, an array that fits in 80 columns on one line (`"protectedBranches": ["main", "master"]`),
a longer one (`protectedPaths`, `generatedPaths`) one item per line. `npm run fix` / `npm run fmt` rewrite the file if the layout differs (whitespace only, no key changes: harmless; do not edit it again to "fix" that, and do not
run a command that names the file, the kit asks the user for those).
