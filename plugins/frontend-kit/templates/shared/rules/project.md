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

## Local quirks

Tooling surprises specific to this repo (nested git folders, ignored directories, custom script wrappers):
