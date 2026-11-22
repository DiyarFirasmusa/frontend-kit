# Project specifics

The rules in this folder refer to project facts they cannot know. They live **here**, not in `CLAUDE.md` (which stays
under its 150-line cap). Fill each line the first time the fact is decided; keep it to one line or one short list.
An empty line is a decision still open: ask the user before inventing the answer.

## Where things are

- i18n setup file and how bundles load (global bundle, per-feature bundles, loader or build-time glob):
- The one helper that translates a key held in data (zod message, `successMessage`, a map of keys):
- Theme tokens file (`src/…/theme.css`) and the semantic utilities in use:
- Formatters (numbers, dates, currency, missing value) and the digit system:
- Test helpers folder (render helpers, MSW server and envelope builders, sign-in helper, fixtures):
- Icon family and chart approach:
- Sign-out function (what it clears: tokens, permissions, query cache, persisted stores):

## Decisions

- Backend: base URL env var, response envelope, error shape, paging shape, OpenAPI file if any:
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
(`dataCollection`; never leave it unset), oxlint 1.x, oxfmt 0.x (still beta), Tailwind 4.3 (v4 names, see `styles.md`), React 19.2+ (`useEffectEvent`, `<Activity>`), TypeScript 5.9+
(6 and 7 change defaults, see `typescript.md`).

## Local quirks

Tooling surprises specific to this repo (nested git folders, ignored directories, custom script wrappers):
