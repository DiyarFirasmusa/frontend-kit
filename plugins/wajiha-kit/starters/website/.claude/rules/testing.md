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
  `document`, no storage) and `dom` runs `*.test.tsx` and `*.dom.test.ts` (jsdom, `src/test/setup.ts`). A plain `.ts`
  test that needs the browser is named `*.dom.test.ts`. The `dom` project shares one environment per worker
  (`isolate: false`): `setup.ts` resets the DOM, storage, the theme attribute and both Zustand stores after each
  test; anything new with module-level state must be reset there.
- Component tests render with `renderWithI18n(ui, locale)` (`src/test/render.tsx`: a fresh i18n instance, like the
  router gives) and use `@testing-library/user-event`.
- Test what a visitor sees and what the server receives. A new form field gets a schema test and a form test; a new
  server-side rule gets a unit test; a new page gets an entry in `PAGES` (`e2e/fixtures/app.ts`), which puts it in the
  SEO, axe, layout-shift and smoke loops.
- Playwright (`e2e/raw` = the server's raw answers, no browser; `e2e/ui` = Chromium in six projects, `ar` and `en` on
  desktop, phone and dark, with axe) runs against the production build served on its own port by
  `scripts/e2e-server.mjs`: `npm run test:e2e`, or
  `E2E_PORT=5461 npx playwright test e2e/ui/contact.spec.ts --project=en-desktop` (`E2E_SKIP_BUILD=1` reuses the
  build). `E2E_BASE_URL=https://...` runs the suite against a deployed site instead.
- e2e rules: use the `t`, `open` and `localized` fixtures (`t` reads the locale files, so copy changes do not break
  tests); wait for state (`toBeVisible`, `toHaveURL`), never for time; `open()` waits for `html[data-hydrated=true]`
  before you click. Every test fails on a console error, a page error or a CSP violation (the `guardConsole`
  fixture); a page that answers 404 on purpose is the only allowed error line.
- The two `perf-*` projects (layout shift) run last and alone; do not make them parallel.
- `npm run check:bundle` (after `npm run build`) starts the built server and proves `/ar`, `/ar/news` and `/ar/contact`
  stay under their gzip budgets and that react-hook-form and zod stay on `/ar/contact`. Raise a budget only on
  purpose, in the same commit, with the reason.
- `npm run check:tooling` fails when a tool is configured but not wired (hooks, CI gates, `.gitignore` for env
  files) and when any doc, comment or message tells people to run an `npm run` script that does not exist.
