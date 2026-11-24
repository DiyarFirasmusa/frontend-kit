---
paths:
  - "**/*.test.{ts,tsx}"
  - "e2e/**"
  - "src/test/**"
  - "vitest.config.*"
  - "playwright.config.*"
---

# Testing

Every task ships with tests, in the project's own runner and test folders; never a second runner, never one installed
unasked. The kit's example stack: **Vitest** (jsdom) + **Testing Library** + **user-event** + **MSW** for unit, component
and integration tests; **Playwright** + **@axe-core/playwright** for end-to-end and accessibility. With that stack:
no Jest, no Cypress, no hand-rolled `fetch` mocks.

## Commands

```sh
npm run test             # vitest run
npm run test:watch       # vitest watch
npm run test:coverage    # v8 coverage → ./coverage
npm run test:e2e         # playwright (starts its own server on :3400)
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
| Accessibility | every page | the axe spec's page list | axe, WCAG 2.2 AA (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`); serious/critical fail |

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
- Async UI: `findBy*` / `waitFor`. Timers: `vi.useFakeTimers()`, which in Vitest 5 also fakes `Temporal` when it exists
  (opt out with `toNotFake: ['Temporal']`). No sleeps.
- `vi.mock`, `vi.unmock` and `vi.hoisted` sit at the top level of the file. In Vitest 5 a call inside a function or block
  throws; it was a warning before.
- Date-dependent UI in e2e (token expiry, "5 minutes ago"): fix the browser clock with Playwright's `page.clock` instead of
  waiting for real time.
- Set the time zone for the unit run (`TZ=UTC` in the script or in global setup, before the workers start; worker threads
  ignore a `TZ` set inside them), so formatting tests do not depend on the machine that runs them.
- E2E sets `timezoneId` and `locale` in the project's `use`, for the same reason.
- Text in both languages where it matters: one English assertion, one Arabic.
- E2E: projects cover Arabic and English, desktop and mobile, and dark. Mock
  the backend with route handlers that return the real envelope. Match text
  in both languages with a regex. Assert `html[dir]` when direction matters.
- axe checks the rendered DOM only: open dialogs and menus before the run. It does not check focus order, focus return,
  announcements, drag alternatives, redundant entry or authentication: those need a Playwright check or a manual pass.
- E2E server: `reuseExistingServer` silently tests whatever already listens on
  the port (another project's dev server turned a whole suite red). Use this
  project's own e2e port (3400, `.claude/wajiha-kit.json`), and if the run fails
  at once on every test, check `lsof -nP -iTCP:3400` before touching code.
- Website (TanStack Start): e2e also asserts the server-rendered HTML (title,
  `lang`, `dir`) before hydration where SEO matters.
- Keep a test file under ~200 lines; split by behaviour. No whole-page snapshots: check structure with
  `toMatchAriaSnapshot` (regenerate those after upgrading to Playwright 1.65).
- Never `it.skip` to get green — fix it or report the bug.
- **A bug fix starts with a test that fails for that bug.** See it fail, fix, see it pass. "Already fixed" or "could not
  reproduce", with the evidence, is a finished task; don't patch on a guess.
- A flaky or hard e2e case (auth, clock, network, mobile): load the
  `playwright-best-practices` skill for the pattern, then keep this file's rules.

## Router and browser APIs in tests

- **TanStack Router:** a `*.test.tsx` beside route files is read as a route unless `routeFileIgnorePattern` excludes it.
- jsdom has no `navigator.locks`: test the lock-less fallback, and the lock itself with a small fake. Do not hit a real timer
  for the lock timeout.
- MSW 3: `http` and `HttpResponse` from `msw/http`, `delay` from `msw/utils/delay`, the server from `msw/node`. MSW 2 imports
  all of them from `msw`. Check the installed package's `exports` before you import. `server.listen()` runs once: a
  second call throws.

## Never

- Never run tests against . E2E uses a fake API host with route
  mocks; manual checks use UAT () or local mocks.
- No real tokens, phone numbers, emails or card data in fixtures.
- No assertions on Tailwind class strings.
- No unresolved `act()` warnings or `console.error` noise from code under test.

## Website specifics (TanStack Start)

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
