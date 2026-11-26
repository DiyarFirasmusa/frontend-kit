---
paths:
  - 'src/api/**'
  - 'src/**/services/**'
  - 'src/**/hooks/query/**'
  - 'src/**/hooks/form/**'
  - 'src/constants/api.ts'
  - 'src/constants/query-keys.ts'
  - 'src/types/api/**'
  - 'src/mocks/**'
  - 'src/test/msw/**'
---

# API layer and the mock backend

Services call the axios clients, query hooks wrap services, page hooks use query
hooks. The clients (`src/api`) own toasts, response unwrapping and 401 handling;
nothing upstream repeats them. `axios` is imported only inside `src/api`.

- Endpoints live in `constants/api.ts`, keys in `constants/query-keys.ts` (`qk.x.all`,
  `lists()`, `list(params)`, `detail(id)`). No inline URLs or key arrays.
- Mirror the backend contract in `src/types/api/<x>.ts` (hand-written for the demo;
  generate from OpenAPI for a real backend). Lists are `PageResponse<T>`
  (`content`, `totalElements`, `totalPages`, `number`, `size`); errors are
  problem+json with `errors: { field: string[] }`. If the real spec differs, change
  `src/types/api/page.ts` and the services that read it, nothing else.
- A service maps UI params to the backend in one `toXListQuery(params)`: 1-based
  page to `page=0`, `name.asc` to `sort=name,asc`, "all" filters left out.
  `fetchX(params, { signal })` forwards the query's `signal`, so leaving the page
  or changing the filters cancels the request. Every `queryFn` forwards it (a test
  checks); the batched directory-entry lookup is the one exception.
- A failed request is toasted once per message (the client sets the toast `id`), so
  a query's one retry does not stack a second toast. Do not silence GET toasts:
  `useListExport` relies on them.
- `xListQueryOptions(params)` / `xDetailQueryOptions(id)` are shared by the route
  loader and the hook; lists use `placeholderData: keepPreviousData`.
- Mutations invalidate in `onSuccess` and **return the promise**, so `isPending`
  lasts until the list has refetched. Delete removes the detail query first, then
  invalidates `lists()`. Optimistic updates only for single-row toggles.
- Success toasts come from `successMessage: '<x>.messages.created'` on the request;
  field errors from a 422 go under the inputs with `applyApiFieldErrors`
  (`src/api/error/field-errors.ts`) and the form never toasts.

## Mocks (`src/mocks`)

One mock backend serves the browser (`npm run dev`), unit tests
(`server.use(...xHandlers)`) and Playwright (`mockApi.backend()`). Handlers match
the path on any origin (`api(path)` from `mocks/core.ts`).

- Copy `handlers/suppliers.ts` for a new entity: `paginate`, `sortBy`, `matches`,
  `validationProblem` (422 with field errors), `notFound`, `fail` (409), one
  in-memory table seeded in `seed/`, registered in `mocks/index.ts`.
- Seeds use generic names. `resetMockDb()` restores the tables before each test.
- Answer like a real backend: a paged list, 404 for a missing id, 422 for a bad
  body, 409 when a rule refuses. Missing or odd backend behaviour is reported, not faked.
