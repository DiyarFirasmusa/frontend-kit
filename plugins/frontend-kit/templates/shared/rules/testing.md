---
paths:
  - "**/*.test.{ts,tsx}"
  - "e2e/**"
  - "src/test/**"
  - "vitest.config.ts"
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
| Accessibility | every page | the axe spec's page list | axe, WCAG 2.1 AA; serious/critical fail |

Minimum per change: the logic you touched is unit-tested; each touched route
component has loading / error / empty / success plus one interaction; a new
page is added to the axe spec; a new or changed flow has an e2e spec.

The flows `CLAUDE.md` marks as critical (its domain rules) stay covered, and
sign-out clearing every piece of user data always does.

## Helpers

The project's test helpers (`CLAUDE.md` names the folder) provide:

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
  requests fail the test.**
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
