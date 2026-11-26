---
paths:
  - '**/*.test.ts'
  - '**/*.test.tsx'
  - 'e2e/**'
  - 'src/test/**'
  - 'vitest.config.ts'
  - 'playwright.config.ts'
  - 'scripts/check-*'
---

# Testing

- Unit tests sit next to the file. Two Vitest projects: `node` runs `*.test.ts` (pure functions: no `window`, no
  `document`, no fetch to the mock API) and `dom` runs `*.test.tsx` and `*.dom.test.ts` (jsdom, `src/test/setup.ts`,
  the mock API through MSW, the i18n instance). A plain `.ts` test that needs the browser is named `*.dom.test.ts`.
  The `dom` project shares one environment per worker (`isolate: false`): `setup.ts` resets stores, storage, mock data,
  handlers, the kept session expiry (`forgetMissedSessionExpiry`) and the language after each test; anything new with
  module-level state must be reset there.
- Helpers: `renderWithProviders` (query client, i18n with the admin text, tooltips), `renderAtUrl` and `renderRoutes`
  (`src/test/render-router.tsx`: a memory router, for links, redirects and router state), `tt('group.key')` for
  expected text, `server.use(...)` (MSW) for one-off API answers. Never hardcode text that exists in a locale file.
- Sign a test user in with `startSession(...)` (`store/session.ts`), not by writing the two stores. The mock answers in
  the page language: set `document.documentElement.lang = 'en'` in the file when you assert on its message text. Form
  labels come from the locale file: `new RegExp(`^${tt('group.key')}`, 'u')`.
- A failing save needs a test for each way it can show: a field error under its input, an error with no field (toast),
  and the dialog staying open with the typed values (copy the three cases from `suppliers/index.test.tsx`).
- Test what a user sees and what the API receives, not implementation. Every new async view gets loading, error and
  empty; every new guard gets a signed-out and a no-permission case; every API-layer rule gets a unit test.
- e2e (`e2e/raw` = server answers without a browser; `e2e/ui` = Chromium in six projects, ar and en on desktop, phone
  and dark, with axe on key pages) runs against the production build served on its own port: `npm run test:e2e`, or
  `E2E_PORT=5441 npx playwright test e2e/ui/admin-flows.spec.ts --project=en-desktop` (add `E2E_SKIP_BUILD=1` to reuse
  the build). The e2e build is a real-site build with the mock API on (the script sets `ALLOW_MOCK_ON_REAL_SITE=1`).
- e2e rules: use the `t`, `open` and `localized` fixtures; wait for state (`toBeVisible`, `toHaveURL`), never for time;
  wait until a sign-in has finished before navigating away (a reload cancels it). Every test fails on a console error,
  a page error or a CSP violation. API 4xx answers that a test provokes on purpose are allowed by the fixture.
- Cold loads: `e2e/ui/admin-reload.spec.ts` seeds `sessionStorage` before the page runs (a session the server
  refuses, or one saved by an older version) and loads each admin URL; copy it for any new loader-driven page.
- Mock users for tests: `viewer` (403 on writes), `expired` (401 after sign-in), `blocked` (401 at login).
- `npm run check:boundaries` writes probe files and proves the import rules in `oxlint.config.ts` fire;
  `npm run build:proof && npm run check:bundle` proves every public page stays small and loads no admin module
  (source-map based; the maps are moved to `.proof-maps/`, and the check fails if `.output` holds a `.map` or the
  server serves one; `npm run check:maps` is the same rule for a plain build). Run both after touching imports in route files.
