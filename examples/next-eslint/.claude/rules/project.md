# Project specifics

The rules in this folder refer to project facts they cannot know. They live **here**, not in `CLAUDE.md` (which stays
under its 150-line cap). Fill each line the first time the fact is decided; keep it to one line or one short list.
An empty line is a decision still open: ask the user before inventing the answer.

## Where things are

- i18n: none (single English LTR app, `lang="en"`); decide a library before adding a second language.
- Theme tokens file and the semantic utilities in use: `src/app/globals.css` (`@theme inline`: `background`, `foreground`; fonts Geist sans/mono)
- Formatters (numbers, dates, currency, missing value) and the digit system:
- Test helpers folder (render helpers, network mocks, sign-in helper, fixtures): none yet, no test runner installed
- Icon family and chart approach:
- Sign-out function (what it clears: tokens, permissions, query cache, persisted stores):

## Decisions

- Backend: base URL env var, response envelope, error shape, paging shape, OpenAPI file if any:
- Auth model (website: server-side session or browser-held token; dashboard: where the refresh token lives):
- Critical flows that must stay covered by tests (the domain rules):
- Paths Claude must not touch beyond the kit's defaults:

## Minimum versions the rules were checked against (November 2026)

Rules name APIs of these majors; when the project is older, check the API before copying a snippet.
Node 22.12+, Next.js 16.4 (App Router; read `node_modules/next/dist/docs/` first, see `AGENTS.md`), React 19.3,
TypeScript 5, eslint 9 (`eslint-config-next`), Tailwind 4.3. Package manager: npm.

## Local quirks

Tooling surprises specific to this repo (nested git folders, ignored directories, custom script wrappers):

- Script wrappers: `npm run check` = typecheck + `lint:check`; `npm run check:full` = check + build.
- No `origin` git remote yet; no formatter, no test runner.
- Kit setup (frontend-kit, react profile, existing mode) created `CLAUDE.md` (imports `AGENTS.md`), `.claude/rules/`,
  `.claude/settings.json`, `.claude/frontend-kit.json`.
