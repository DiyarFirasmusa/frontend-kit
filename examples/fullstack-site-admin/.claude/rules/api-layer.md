---
paths:
  - "src/shared/api/**"
  - "src/shared/server/**"
  - "src/features/**/services/**"
  - "src/shared/**/services/**"
  - "src/features/**/server/**"
  - "src/shared/**/server/**"
  - "src/features/**/queries/**"
  - "src/shared/**/queries/**"
  - "src/features/**/hooks/query/**"
  - "src/shared/**/hooks/query/**"
  - "src/shared/constants/api.ts"
  - "src/shared/env.ts"
  - "src/test/msw/**"
---

# API layer

Services call one HTTP client; query options and mutation hooks wrap the
services; page hooks use those. Envelope unwrapping, error normalising, auth
refresh and user feedback each happen in **one** place.

## Two places code runs

| Runs in | What | May use |
| ------- | ---- | ------- |
| Server and browser | loaders, `beforeLoad`, `queryFn`s, services | `VITE_API_BASE_URL`, the shared client, no secrets |
| Server only | server function handlers, `*.server.ts`, server routes | secrets (`process.env.*` without prefix), HttpOnly cookies, server SDKs |
| Browser only | event handlers, effects, toasts | `window`, `localStorage`, `toast()` |

- The shared client is isomorphic: the base URL is absolute
  (`VITE_API_BASE_URL`), because a relative `/api` proxy only exists in the
  browser dev server, not during SSR.
- Validate env once with zod: `src/shared/env.ts` for `VITE_*` (client-safe),
  `src/shared/server/env.server.ts` for server-only values, read inside a
  function (edge runtimes have no env at module load).

## Folders

```
src/shared/api/
├── client.ts          the one HTTP client (fetch wrapper or axios): base URL, language header, timeout
├── envelope.ts        unwraps the backend envelope, if the backend has one
├── errors.ts          ApiError { status, code, message, payload } + isApiError, getErrorStatus, resolveErrorMessage
└── not-found.ts       notFoundOn404(error): rethrows a 404 as notFound(), anything else as is
src/shared/server/     server functions + server-only helpers used by 2+ features
src/shared/services/   client-safe services used by 2+ features
src/shared/constants/api.ts         endpoints
src/shared/constants/query-keys.ts  qk
```

The HTTP library (fetch or axios) is imported only inside `src/shared/api/`.

## Envelope and errors

- If the backend wraps responses (e.g. `{ isSuccess, message, data }`), the
  client unwraps it; services return `data` typed from the generated API
  types. A "200 with failure flag" becomes the same `ApiError` as an HTTP error.
- Every failure is an `ApiError` with `status`, a backend `code` if any, the
  backend `message` and the raw `payload`. Callers branch on `status`/`code`,
  never on message text.
- `resolveErrorMessage(error, t)`: backend message when it is in the UI
  language → known code → status fallback (429, 5xx, network) → generic.
- Types come from the backend contract (OpenAPI → generated file). Never
  hand-edit the generated file; never invent a response shape. Missing field
  or endpoint → say so and offer `backend-request`.

## Feedback: one place, client only

- Mutation toasts come from the `MutationCache` `onSuccess` / `onError`
  handlers on the per-request `QueryClient`, driven by `meta`:
  `meta: { successMessage: 'products.saved' }`, `meta: { silent: true }`,
  `meta: { silentErrorStatuses: [409] }`. Hooks and components never call
  `toast()` for API results.
- Read errors are **not** toasted: an awaited loader read fails into the
  route `errorComponent`; a streamed or client-only section shows its own
  inline error with retry.
- Flows that render an error themselves (an inline field error, a conflict
  dialog) mark the mutation `silentErrorStatuses` and handle it in the page hook.
- Field-level validation errors from the backend map onto the form with
  `setError`, not a toast.

## Auth and sessions

- The session lives in an HttpOnly cookie. Tokens never go into
  `localStorage`, loader data, query keys or the HTML.
- Pick one model per project and write it in `.claude/rules/project.md`:
  - **Server-side session (preferred for SSR):** private reads/writes go
    through server functions that read the cookie and call the backend, so
    private pages can render on the server (with `private, no-store`).
  - **Browser-held token:** private pages run with `ssr: false` and
    `noindex`; the client refreshes once on 401 (single-flight) and retries
    once.
- **Backend returns the refresh token in the JSON body** (common): the access
  token stays in memory only; login, register, refresh and logout are server
  functions that keep the refresh token in an HttpOnly cookie. A non-secret
  hint cookie (`session=1`) tells the client whether a refresh is worth trying,
  so guests never call it. A memory-only token with no cookie signs the user out
  on every reload.
- 401 handling lives in the client (or the server function base) only:
  refresh once, retry once, then the session-expired path. Never handle 401
  in a feature.
- Public pages never depend on the session: catalogue reads are never gated
  on being signed in.

## Services

```ts
export async function fetchProduct(slug: string): Promise<ProductDto> {
  return apiClient.get<ProductDto>(endpoints.products.detail(slug))
}
```

- Free async functions, verb first, typed in and out. Feature-only in the
  feature's `services/`; 2+ features in `src/shared/services/`.
- No URL literals: every path comes from `endpoints`.
- No error parsing, toasts or navigation in services; return data or throw.
- Language goes in one header from the client (from the request's i18n on
  the server, the current language in the browser), never per call.

## Tests

- MSW mocks the network for services, query options and containers; never
  mock the client, services or Query with `vi.mock`.
- Envelope builders (`ok(data)`, `fail(message, { status })`) live in
  `src/test/msw/`. Unhandled requests fail the test
  (`onUnhandledFrame: 'error'` on MSW 3, `onUnhandledRequest` on MSW 2).
- Server functions are tested by calling the handler logic (`*.server.ts`)
  directly with fixtures, plus one e2e through the built server.

## Server functions return results, not thrown errors

An `Error` thrown in a server function reaches the browser as a plain `Error`:
`status`, `code` and field `errors` are lost, so a form cannot show "wrong
credentials" or map a 422 onto fields. Handlers return

```ts
type ServerResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code: string; message: string; errors?: Record<string, string> };
```

and the client side (`mutationFn`) converts `ok: false` into the project's
`ApiError`, so the one `MutationCache` handler and the field mapping work the
same as for direct calls. Split cookie I/O from logic (`refreshOnServer(token, io)`)
so the logic is testable.
