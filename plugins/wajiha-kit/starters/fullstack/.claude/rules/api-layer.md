---
paths:
  - 'src/features/admin/api/**'
  - 'src/features/admin/**/*.service.ts'
  - 'src/features/admin/**/use-*-queries.ts'
  - 'src/features/admin/mocks/**'
  - 'src/features/admin/types/**'
  - 'src/features/admin/lib/query-client.ts'
  - 'src/shared/store/toast-store.ts'
---

# Admin API layer

One flow: `<x>.service.ts` calls `privateApi` (or `publicApi` for login), `use-<x>-queries.ts` wraps it in TanStack
Query, `use-<x>-page.ts` uses the hooks. Components never call axios.

- `axios` is imported only in `src/features/admin/api`. Paths come from `api/endpoints.ts`, query keys from
  `api/query-keys.ts` (`qk.<resource>`). Shapes come from `types/api.ts`; the mock and a real backend both match it.
- `privateApi` adds `Authorization: Bearer <token>` and `Accept-Language`. A 401 that carried the CURRENT session
  clears it and calls `emitSessionExpired()`; `AdminRoot` listens and navigates to login with `reason=expired`.
  The API layer never imports the router or any UI.
- Errors: the API layer toasts once per failure (identical error toasts are collapsed, so retries do not stack).
  A caller that shows the error itself passes `silentError: true`. Success toasts: `successMessage: '<i18n key>'`.
- Queries retry only network errors and 5xx, twice. Mutations never retry. A mutation invalidates its own list
  (`qk.<resource>.all`) and `qk.overview`.
- A request that must carry a token after the store was cleared (logout) passes `headers.Authorization` itself,
  because the interceptor reads the store when the request is sent.
- A list endpoint answers a page past the end with `items: []` and the real `total`; the page hook moves to the last page.
- Mock API (`mocks/`): same paths and shapes as the backend, active only when `VITE_ADMIN_API_MOCK=true`. It MUST enforce
  what a backend enforces: no valid token is 401, a missing permission is 403 (tokens look like `mock-token-<role>-<id>`).
  It does not clamp or repair bad input. Demo users: any name (administrator), `viewer`, `expired`, `blocked`.
  Nothing outside `mocks/start-mocks.ts` imports the mocks; a build with the mock off must contain no MSW.
- Adding an entity to the mock: data in `seed.ts` and `db.ts`, handlers in `handlers.ts` that start with
  `denied(request, PERMS.<resource>.<action>)`.
