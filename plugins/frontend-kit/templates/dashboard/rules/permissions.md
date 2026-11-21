---
paths:
  - "src/constants/permissions.ts"
  - "src/store/permission-store.ts"
  - "src/guards/**"
  - "src/routes/_app/**"
  - "src/app/(app)/**"
  - "src/proxy.ts"
  - "src/layout/app/**"
  - "src/features/**/hooks/*-actions.ts"
  - "src/shared/constants/permissions.ts"
  - "src/shared/store/permission-store.ts"
  - "src/shared/guards/**"
  - "src/layout/**"
  - "src/layouts/dashboard/**"
---

# Permissions

> Paths below are the default layout. A project with `.claude/rules/structure.md` (the Next.js and TanStack Start variants)
> reads them through that file's path map (`src/shared/…`, `layouts/`, `api/client/`, …).

The backend enforces access. The frontend mirrors it so people only see what
they can use and get a clear 403 instead of a broken page.

## One source of names

- `PERMS` in `src/constants/permissions.ts`, nested by entity, values exactly
  the backend's strings (from the token claims or the `/me` response):

```ts
export const PERMS = {
  users: { view: 'users:read', create: 'users:create', update: 'users:update', delete: 'users:delete' },
} as const;
type Leaves<T> = T extends string ? T : { [K in keyof T]: Leaves<T[K]> }[keyof T];
export type Permission = Leaves<typeof PERMS>;
```

- Never a permission string literal anywhere else.
- A snapshot test pins the list, so a rename on either side is noticed.

## Where permissions come from

- After login and after every refresh, the permission store is replaced with
  the roles and permissions from the token or `/me`. Never merged, never
  edited by the UI.
- A super-admin role (if the backend has one) is handled in exactly one
  function, `isGranted(state, permission)`.
- Sign-out clears the store with the rest of the session.

## Checking

| Where                         | How                                                      |
| ----------------------------- | -------------------------------------------------------- |
| Route `beforeLoad` (Next.js: the `(app)` layout gate and each page's `<RequirePermission>`) | `requirePermission(PERMS.x.view)` → redirect to `/403`   |
| Render (buttons, columns, nav)| `useHasPermission(PERMS.x.create)` — reactive selector   |
| Pure helpers (`*-actions.ts`) | take a `can: (p: Permission) => boolean` argument, from `useCan()` (a reactive, memoised checker) |
| Event handlers                | `hasPermission()` (reads `getState()` once)              |

`hasPermission()` in render shows a stale answer after a refresh changes the
permissions; use the hook wherever the result gates JSX.

## UI behaviour

- No permission for a page: the nav item is hidden and the route redirects to `/403`.
- No permission for an action: the button, row action, bulk action or column
  is **not rendered**. Do not render a disabled button for a missing permission.
- Allowed in general but not for this record (state, ownership): render it
  disabled with the reason in a tooltip.
- Nav config items carry their `permission`; a group with no visible items is hidden.
- An empty list with the create permission shows the create action; without
  it, only the empty message.
- A 403 from the API (permissions changed server-side) toasts once and
  refreshes the permission data; it never signs the user out.

## Tests

- `isGranted` and every `getXRowActions` are unit-tested with and without each permission.
- One integration test per guarded page: no permission → `/403`.
- Test helpers set permissions explicitly; never rely on a persisted store.


## Read-only mode

"May open the page but not edit it" is a different state from "may not see it":

- The form is wrapped in `<fieldset disabled>`; components that ignore fieldset (a base-ui `Switch`, custom
  toggles) get `disabled` explicitly; inline table toggles become plain badges.
- No save/submit button, and a visible read-only notice says why.
- A 403 from the backend refreshes the permission data (`/me`) and calls `router.invalidate()` (Next.js: `router.refresh()`) so guards re-run; the
  `(errors)/403` page renders inside the signed-in shell, not bare.

## Don't

- No role-name checks (`role === 'admin'`) in features; check a permission.
- No security decisions in the frontend that the backend does not also enforce.
