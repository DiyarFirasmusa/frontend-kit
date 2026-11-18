---
paths:
  - "**/*.test.{ts,tsx}"
  - "e2e/**"
  - "src/test/**"
  - "vitest.config.*"
  - "playwright.config.ts"
---

# Testing

Every task ships with tests. The stack: **Vitest** (jsdom) + **Testing
Library** + **user-event** + **MSW** for unit, component and integration
tests; **Playwright** + **@axe-core/playwright** for end-to-end and
accessibility. No Jest, no Cypress, no hand-rolled `fetch` mocks.

## Commands

```sh
npm run test             # vitest run
npm run test:watch       # vitest watch
npm run test:coverage    # v8 coverage → ./coverage
npm run test:e2e         # playwright (starts its own server on :{{E2E_PORT}})
npm run test:e2e:ui      # playwright UI mode
npm run e2e:install      # once: download Chromium
npm run check            # typecheck + lint:check + test
npm run check:full       # check + e2e + build
```

(`CLAUDE.md` wins where its script names differ.)

## What to write

| Layer | Target | File | Tool |
| ----- | ------ | ---- | ---- |
| Unit | `utils/`, schemas, `*-actions.ts`, stores, page hooks (`renderHook`) | `<name>.test.ts` beside the source | vitest |
| Component | presentational components | `<name>.test.tsx` beside the source | the providers render helper |
| Integration | every route component with the real API client, query cache and a memory router | `<name>.test.tsx` beside it | the router render helper + MSW |
| End-to-end | each user flow | `e2e/<flow>.spec.ts` | Playwright + mocked API routes |
| Accessibility | every page | the axe spec's page list | axe, WCAG 2.2 AA (tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`); serious/critical fail |

Minimum per change: the logic you touched is unit-tested; each touched route
component has loading / error / empty / success plus one interaction; a new
page is added to the axe spec; a new or changed flow has an e2e spec.

The flows `project.md` marks as critical (its domain rules) stay covered, and
sign-out clearing every piece of user data always does.

## Helpers

The project's test helpers (`project.md` names the folder) provide:

- a providers render helper → `{ user, queryClient, ...rtl }` with the query
  client and the `dir` wrapper, for components and hooks without the router;
- a router render helper with a memory history, for anything with
  `useNavigate`, params, search or `<Link>`; assert navigation on the
  router's current location;
- language helpers to switch to Arabic and translate keys in assertions
  (reset to one language after each test);
- an MSW `server`, an `api(path)` URL builder and response builders that
  produce the backend's real envelope (success, failure — including failure
  with HTTP 200 if the backend does that — and paged lists). **Unhandled
  requests fail the test** (`server.listen({ onUnhandledFrame: 'error' })` on MSW 3;
  `onUnhandledRequest` on MSW 2). With an absolute API URL, set
  `test.environmentOptions.jsdom.url` to the API origin, or jsdom's CORS check
  fails every request as a "Network Error".
- auth fixtures (signed-in user, token response) and a store reset after
  every test.

## Conventions

- Colocate tests beside the source. No `__tests__` folders; `.spec.ts` only in `e2e/`.
- Query like a user: `getByRole`, `getByLabelText`, `getByText(<translated key>)`.
  `data-testid` only when nothing accessible exists — and then fix the markup.
- Mock the **network** (MSW), never modules: no `vi.mock` of services, hooks,
  the API client or TanStack Query. The interceptors, toasts and cache are
  part of what is tested.
- Async UI: `findBy*` / `waitFor`. Timers: `vi.useFakeTimers()`. No sleeps.
- Text in both languages where it matters: one English assertion, one Arabic.
- E2E: projects cover Arabic and English, desktop and mobile, and dark. Mock
  the backend with route handlers that return the real envelope. Match text
  in both languages with a regex. Assert `html[dir]` when direction matters.
- E2E server: `reuseExistingServer` silently tests whatever already listens on
  the port (another project's dev server turned a whole suite red). Use this
  project's own e2e port from `.claude/frontend-kit.json`, and if the run fails
  at once on every test, check `lsof -nP -iTCP:<e2ePort>` before touching code.
- Website (TanStack Start): e2e also asserts the server-rendered HTML (title,
  `lang`, `dir`) before hydration where SEO matters.
- Keep a test file under ~200 lines; split by behaviour. No whole-page snapshots.
- Never `it.skip` to get green — fix it or report the bug.
- A flaky or hard e2e case (auth, clock, network, mobile): load the
  `playwright-best-practices` skill for the pattern, then keep this file's rules.

## Never

- Never run tests against {{LIVE_HOST}}. E2E uses a fake API host with route
  mocks; manual checks use UAT ({{UAT_HOST}}) or local mocks.
- No real tokens, phone numbers, emails or card data in fixtures.
- No assertions on Tailwind class strings.
- No unresolved `act()` warnings or `console.error` noise from code under test.

## Dashboard specifics (all frameworks)

- Every API call is made by the browser (no SSR loaders), so Playwright route mocks on a fake host are enough; the host
  never has to exist. The mock table fails the test on an endpoint it does not know and on any other host, answers with
  the real envelope, error codes and permission checks, and offers three users: an admin, a viewer without the write
  permission, and one without the list's read permission (opening the list must end on `/403`, also after signing in
  through the form).
- The API base URL is baked into the bundle at build time (`VITE_*`, `NEXT_PUBLIC_*`): set the fake URL in
  `webServer.env` for the build itself, and keep `reuseExistingServer: false` (a reused server may hold a build made
  with another URL). `check:full` ends with `npm run build`, which needs the real variable (an env file or an export).
- Name the fixture callback `provide`, not `use`: the react-hooks lint rule flags `use(...)` as a hook.
- **Vite + TanStack Router:** the dev server on the e2e port is enough.
- **Next.js:** `next build && next start --port <e2ePort>`, not `next dev` (no first-hit compiles, no dev overlay for
  axe). Build into its own folder (`distDir: process.env.NEXT_DIST_DIR || '.next'`, `NEXT_DIST_DIR=.next-e2e`) so the
  real `.next` never holds the fake URL; add it to `.gitignore`, `tsconfig` excludes and the lint ignores.
- **TanStack Start (SPA mode):** `vite build`, then serve `dist/client` with `e2e/serve-spa.ts` (the variant ships it:
  real files as they are, every other path gets `/_shell.html`, like the production host). Not `vite preview`: on Start
  it runs the SSR bundle, whose guards see no session and 307 every signed-in deep link to `/login`. Not
  `vite build --outDir <other>`: the prerender still renders `_shell.html` from `dist/server`, so the shell points at
  files the other folder lacks. No `data-hydrated` wait: the shell has no page content to click early. Rebuild with the
  real API URL after an e2e build (it left the fake one in `dist/`).

## Website specifics (TanStack Start; the website profile only)

- `createIsomorphicFn().server().client()` always takes the server branch under
  Vitest and `createServerFn` cannot run there. Alias those two boundaries to
  small stubs in `vitest.config.ts` (a fake language getter, fake auth server
  functions) and test the logic behind them directly.
- A `renderRoute({ url, routeId })` helper that builds the route id chain, adds
  the `stripSearchParams` defaults and the sibling routes covers most page tests.
- E2E runs against the production build (`vite build && vite preview --port
  <e2ePort> --strictPort`) **and a fake API server**: Playwright cannot
  intercept the server-side fetches of SSR loaders.
- SSR markup is clickable before it is hydrated and the click does nothing. The
  root document sets `data-hydrated` on `<html>` after hydration; e2e helpers
  `gotoHydrated()` wait for it. URL-bound controlled inputs flip only after the
  loader finishes: click, then assert the URL.
- `register(name, { valueAsNumber: true })` on radio inputs still yields a
  string; use `setValue(name, number)` or `z.coerce` for ratings.
- Offline benches: set the Playwright Chromium path in config instead of
  running `e2e:install`.
