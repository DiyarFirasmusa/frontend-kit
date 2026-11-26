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
  (`isolate: false`): `setup.ts` resets the DOM, storage and the theme attribute after each test; anything new
  with module-level state must be reset there.
- Component tests render with `renderWithI18n(ui, locale)` (`src/test/render.tsx`: a fresh i18n instance, like the
  router gives) and use `@testing-library/user-event`.
- Test what a visitor sees and what the server receives. A new form field gets a schema test and a form test; a new
  server-side rule gets a unit test; a new page gets an entry in `PAGES` (`e2e/fixtures/app.ts`), which puts it in the
  SEO, axe, layout-shift and smoke loops. `src/routing-head.test.ts` walks the real route tree and fails for a public
  route without title, description, canonical and alternates (a page not in `NAV` is the usual cause).
- Playwright (`e2e/raw` = the server's raw answers, no browser; `e2e/ui` = Chromium, one project per language in
  `LOCALES` on desktop, phone and dark, built in `playwright.config.ts`, with axe) runs against the production build served on its own port by
  `scripts/e2e-server.mjs`: `npm run test:e2e`, or
  `E2E_PORT=5461 npx playwright test e2e/ui/contact.spec.ts --project=en-desktop` (`E2E_SKIP_BUILD=1` reuses the
  build). `E2E_BASE_URL=https://...` runs the suite against a deployed site instead.
- e2e rules: use the `t`, `open` and `localized` fixtures (`t` reads the locale files, so copy changes do not break
  tests); wait for state (`toBeVisible`, `toHaveURL`), never for time; `open()` waits for `html[data-hydrated=true]`
  before you click. Every test fails on a console error, a page error or a CSP violation (the `guardConsole`
  fixture); a page that answers 404 on purpose is the only allowed error line.
- The `perf-*` projects (layout shift: each language on desktop and phone) run last and alone; do not make them
  parallel.
- Tests that read copy or the registry take them from `resources`, `LANGUAGES`, `SITE` or the `t` fixture, so renaming
  the demo company or adding a language does not break them. They never hard-code "exactly two languages", and the
  "unsupported language" in a test is the fake code `zz`, never a real one such as `fr`: adding a language must need no
  test edit (`npm run check` is the proof: adding `fr` to a copy of this starter leaves the whole suite green).
  The same goes for pages: a test derives its list from `NAV`, the route tree or `PAGES`, not from a literal list.
  Component tests that render a router (`site-header.test.tsx`) build a tiny one; `src/routing.test.ts` and
  `src/routing-head.test.ts` load the real route tree (`src/test/load-route.ts`).
- `npm run check:bundle` (after `npm run build`) starts the built server and proves `/ar`, `/ar/news` and `/ar/contact`
  stay under their gzip budgets and that react-hook-form and zod stay on `/ar/contact`. Raise a budget only on
  purpose, in the same commit, with the reason.
- `npm run check:tooling` fails when a tool is configured but not wired (hooks, CI gates, `.gitignore` for env
  files) and when any doc, comment or message tells people to run an `npm run` script that does not exist.
