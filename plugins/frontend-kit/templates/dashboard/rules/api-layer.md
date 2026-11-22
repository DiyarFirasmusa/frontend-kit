---
paths:
  - "src/api/**"
  - "src/**/services/**"
  - "src/**/hooks/query/**"
  - "src/constants/api.ts"
  - "src/constants/query-keys.ts"
  - "src/hooks/use-refresh-token.ts"
  - "src/test/msw/**"
  - "src/shared/api/**"
  - "src/**/api/*.api.ts"
  - "src/shared/constants/api.ts"
  - "src/shared/constants/query-keys.ts"
  - "src/shared/hooks/use-refresh-token.ts"
---

# API layer

> Paths below are the default layout. A project with `.claude/rules/structure.md` (the Next.js and TanStack Start variants)
> reads them through that file's path map (`src/shared/…`, `layouts/`, `api/client/`, …).

Services call the axios clients; query hooks wrap the services; page hooks use
the query hooks. Toasts, envelope unwrapping and 401 handling belong to the
clients and are never re-implemented upstream.

## Folder structure

```text
src/api/
├── core/config.ts             → base URL from {{API_BASE_ENV}}, request flags (module augmentation), getLanguage()
├── core/interceptors.ts       → prepareRequest, handleResponse (unwrap + success toast), rejectError
├── client/private.ts          → privateApi: Bearer + single-flight refresh on 401 + one retry
├── client/public.ts           → publicApi: no token (login, refresh, public lookups)
└── error/                     → resolveApiErrorMessage, field-error extraction, status fallbacks
src/constants/api.ts           → endpoints (nested const, path params as functions)
src/constants/query-keys.ts    → qk
src/services/token.service.ts  → refresh call through publicApi
```

`axios` is imported only inside `src/api/**` and `src/services/token.service.ts`.

## Request flags

Declared once by augmenting `AxiosRequestConfig` in `core/config.ts`:

```ts
silent?: boolean                          // no success toast
silentError?: boolean                     // no error toast (background, polling, best effort)
silentErrorStatuses?: readonly number[]   // no error toast for these statuses only
successMessage?: string                   // i18n key when the backend sends no message
skipAuthHandling?: boolean                // no refresh, no redirect, no toast (logout)
keepSession?: boolean                     // a 401 is reported, never refreshed (wrong old password)
isRetry?: boolean                         // set by the client on the one retry after a refresh; never set by callers
```

## Envelope

If the backend wraps responses (`{ success, message, data }` or similar),
`handleResponse` unwraps it and turns a `success: false` body into a rejected
`AxiosError`, so services read the payload directly and errors flow one way.
If it does not wrap, declare the real shape per endpoint. Never invent one;
mirror `docs/api/openapi.json`.

## Feedback in one place

- Every non-GET success toasts once (backend message in the UI language, else
  `successMessage`). Steps that are not the user's action pass `{ silent: true }`.
- Every error toasts `resolveApiErrorMessage(error)`: backend text → status
  fallback (403, 404, 409, 422, 429, 5xx) → network → generic. Cancellation
  never toasts.
- A screen with its own UI for an error (field errors, conflict dialog)
  passes `silentError` / `silentErrorStatuses` and renders it itself.
- Components and hooks never call `toast` for API results.

## 401 and refresh

- `privateApi` attaches `Authorization: Bearer <token>` from memory (or the
  auth store), plus `Accept-Language`.
- On 401: one module-level refresh promise shared by every request that failed
  meanwhile (single-flight); each retries **once** (`isRetry` flag). Refresh
  fails → clear session, query cache and stores, redirect to `/login?redirect=…`.
- The refresh call goes through `publicApi` with `silent` + `silentError` and
  never triggers itself.
- 403 is not 401: no refresh, no sign-out; show the forbidden toast or page
  (`permissions.md`).

## Services

```ts
export async function fetchUsers(params: UserListParams, options?: { signal?: AbortSignal }): Promise<UserListResponse> {
  const { data } = await privateApi.get<UserListResponse>(endpoints.users.list, { params, signal: options?.signal });
  return data;
}
```

- Free async functions, verb first: `fetchX`, `createX`, `updateX`, `deleteX`, `bulkDeleteX`.
- Typed from the OpenAPI schema (generated types when the project has them),
  field names exactly as returned.
- The service maps UI params to the backend's names (1-based page → `page=0`,
  `name.asc` → `sort=name,asc`) in one `toXQuery(params)` helper.
- No error parsing, no toasts, no navigation in services.
- Cancellation: pass TanStack Query's `signal` into the service (`queryFn: ({ signal }) => fetchUsers(params, { signal })`)
  and forward it to the client, so leaving the page aborts the request. A timeout is not a cancel: show it as a network
  error with a retry.
- The clients set a default `timeout` (uploads override it). `axios.isCancel(error)` is a cancel; `ECONNABORTED` and
  `ETIMEDOUT` are failures and toast.
- Auth, session, permission and money responses are parsed with zod in the service: generated types check nothing at
  run time. A failure is rejected with code `invalid_response` and reported without the body.

## Polling and realtime

- Polling (`refetchInterval`) passes `silentError`, backs off on errors and stops when the data is final.
- One realtime connection per view: closed on unmount, reconnecting with a back-off.

## Query keys and options

```ts
export const qk = {
  users: {
    all: ['users'] as const,
    lists: () => ['users', 'list'] as const,
    list: (params: UserListParams) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
} as const;
```

- Every key comes from `qk`; `all` prefixes the family so one invalidation clears it.
- Each feature exports `xListQueryOptions(params)` / `xDetailQueryOptions(id)`
  (`queryOptions` from TanStack Query) used by both the route loader and the hook.
- Lists: `placeholderData: keepPreviousData`. Lookups for selects:
  a longer `staleTime`. The QueryClient's default `staleTime` is above 0, so a hover or a remount is not a request.
- `enabled: Boolean(id)` on every query that depends on an id or selection.
- Mutations invalidate `qk.x.all` in `onSuccess` at the hook (`forms-crud.md`).
- Sign-out clears the whole query cache.


## Sessions, blobs and downloads

- **Session restore.** The access token lives in memory only. Prefer an HttpOnly cookie or BFF for the refresh token and
  ask the backend for it. Without one it survives a reload in `sessionStorage`, which any XSS can read: the backend must
  rotate it on each use and expire it; never `localStorage`, never the URL. `bootstrapSession()` runs before the first
  render, restores permissions from `/me`, and the router mounts after it (Next.js: the `(app)` gate waits). A hook registry
  (`registerSessionHooks({ onSessionExpired, onForbidden })`) lets the API layer call the session layer without a
  circular import.
- **Blob and CSV responses.** The envelope unwrap skips `responseType: 'blob'`; the file name comes from
  `content-disposition` (the backend must `exposeHeaders` it cross-origin); one shared `downloadBlob` util saves it.
  Errors on a blob request arrive as a blob too: parse it before showing a message.

## Don't

- No `axios` outside the API layer; no inline URLs or key arrays.
- No `useEffect` + fetch; no server data in Zustand.
- No 401 handling, retry loops or toasts anywhere but the clients.
