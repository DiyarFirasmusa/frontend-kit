---
paths:
  - '**/*.test.ts'
  - '**/*.test.tsx'
  - 'src/test/**'
  - 'e2e/**'
  - 'vitest.config.ts'
  - 'playwright.config.ts'
---

# Testing

Vitest (jsdom) for units, components and page integration; Playwright + axe for
the real browser. `npm run test` runs in about 40 seconds because workers share
modules (`isolate: false`); that shapes how tests are written.

- **No `vi.mock`**: a module mock leaks into the next file in the worker. Use the
  MSW server (`server.use(...)`), real stores and the real i18n instance.
- `src/test/setup.ts` resets stores, storage, MSW handlers, the mock database,
  vitest timers and the query client after every test. State a test must keep
  across tests does not exist; set it up in `beforeEach`.
- A file that calls `vi.resetModules()` must be listed in `RESETS_MODULES` in
  `vitest.config.ts` (it runs isolated); otherwise it breaks the next file in its worker.
- **Pages**: `renderApp('/suppliers?...')` mounts the real route tree (guards,
  search schemas, loaders); `signIn({ roles: [], permissions })` first. Serve data with
  the shared mock handlers (`server.use(...supplierHandlers)`, `resetMockDb()`).
  Assert the requests too: record `METHOD path?query` through
  `server.events.on('request:start', ...)`, and remove the listener in `afterEach`.
- Every list has: first page and paging through the URL, server sort, filters from a
  shared link and clear, error row and retry, delete confirm (focus on Cancel, one
  DELETE), a blocked delete that sends nothing, the view-only user, a backend 422
  under the input, edit loading the record by id.
- Pure parts have their own tests: the search schema (numeric `q`, bad enum, empty
  URL), `toXListQuery`, row actions per permission, column ids that sort, form mappers.
- Query text with `tt(key)` (`@/test/i18n`); roles and labels over test ids.
- **e2e**: `mockApi.backend()` serves `src/mocks` over `page.route`; `loginAs(page, mockApi)`
  signs in. Specs run in four projects (ar/en x light/dark), so match both languages.
  Pick a free port with `E2E_PORT` (default 3100); Playwright starts and stops its
  own dev server. Add an a11y page in `e2e/a11y-pages/<x>.ts` (axe runs on every one).
- Tests are held to the same boundary lint as source and stay under 600 lines.
