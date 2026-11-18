# Project specifics

The rules in this folder refer to project facts they cannot know. They live **here**, not in `CLAUDE.md` (which stays
under its 150-line cap). Fill each line the first time the fact is decided; keep it to one line or one short list.
An empty line is a decision still open: ask the user before inventing the answer.

## Where things are

- i18n setup file and how bundles load (global bundle, per-feature bundles, loader or build-time glob): site `src/shared/lib/i18n/` (create-i18n.ts, resources.ts); admin `src/admin/lib/i18n/`; per-feature `locales/{ar,en}.json`
- The one helper that translates a key held in data (zod message, `successMessage`, a map of keys):
- Theme tokens file (`src/…/theme.css`) and the semantic utilities in use: `src/shared/style/theme.css`
- Formatters (numbers, dates, currency, missing value) and the digit system:
- Test helpers folder (render helpers, MSW server and envelope builders, sign-in helper, fixtures): site `src/test/` (render helpers, `msw/`, fixtures); admin `src/admin/test/`
- Icon family and chart approach:
- Sign-out function (what it clears: tokens, permissions, query cache, persisted stores):

## Decisions

- Backend: base URL env var, response envelope, error shape, paging shape, OpenAPI file if any: site `VITE_API_BASE_URL` (`src/shared/env.ts`), admin `VITE_ADMIN_API_BASE_URL` (`src/admin/env.ts`); rest open
- Auth model (website: server-side session or browser-held token; dashboard: where the refresh token lives):
- Language source (cookie, URL, user setting) and what stays the same across languages:
- Critical flows that must stay covered by tests (the domain rules):
- Paths Claude must not touch beyond the kit's defaults:

## Minimum versions the rules were checked against (November 2026)

Rules name APIs of these majors; when the project is older, check the API before copying a snippet.
Node 22.12+, Vite 6.4+ (Vitest 5), TanStack Query 5.102+ (`queryClient.query()`), TanStack Table 9, zod 4,
react-hook-form 7, i18next 27 (`fallbackLng` defaults to false; an empty string falls back; `createInstance()` does
not inherit plugins, call `use()` on each per-request instance), MSW 3 (`onUnhandledFrame`; no cookie jar or fake-timer
patching in Node), Vitest 5 (`clearMocks` on; un-awaited async assertions fail), Playwright 1.65, Sentry 11
(`dataCollection`; never leave it unset), oxlint 1.x, oxfmt 0.x (still beta), Tailwind 4.3.

## Local quirks

Tooling surprises specific to this repo (nested git folders, ignored directories, custom script wrappers):
- Two apps in one tree: site routes `src/routes/_site`, admin code `src/admin`, admin routes `src/routes/admin` (URL `/admin`). Admin rules are `admin-*.md`.
- Lint/format run through `node scripts/oxc.mjs` (`npm run lint`, `lint:check`, `fmt`, `fmt:check`).
- i18n validators: site `node scripts/i18n-validate.mjs`, admin `node scripts/validate-i18n-admin.ts`; `npm run i18n:validate` runs both.
- Dev server on 3300, e2e/preview on 3400. No `origin` remote yet, so `githubRepo` is empty.
- Sentry is admin-only (`src/admin/lib/monitoring.ts`).
