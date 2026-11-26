---
paths:
  - 'src/features/admin/constants/permissions.ts'
  - 'src/features/admin/guards/**'
  - 'src/features/admin/store/**'
  - 'src/features/admin/components/can.tsx'
  - 'src/features/admin/layout/nav-config.ts'
  - 'src/features/admin/layout/admin-nav.tsx'
  - 'src/routes/$locale_/admin/**'
---

# Sessions and permissions

- Permissions are `<resource>:<action>` strings in `constants/permissions.ts` (`PERMS.supplier.write`), mirrored from
  the backend. The `admin` role (`SUPER_ROLE`) passes every check. Roles and permissions arrive in the login response.
- Hiding is cosmetic; the BACKEND decides (the mock API does too: 403). Three places say the same thing and must
  match: the route guard (`requirePermission(locale, PERMS.x.read)` in the route's `beforeLoad`), the nav item
  (`permission:` in `layout/nav-config.ts`), and the buttons (`<Can permission=...>` or `useCan`).
  A new page that appears in the nav needs its guard in the route file.
- The session (user and token) and the permissions live in `sessionStorage` through two Zustand stores
  (`admin-auth`, `admin-permissions`): closing the tab ends the session. Only `api/client.ts` reads the token.
  A real backend should set an HttpOnly cookie instead (see STRUCTURE.md).
- Sign-out: send the logout request WITH the token (explicit header), cancel in-flight queries, clear the stores,
  navigate to login, then clear the query cache. Session expiry (a 401): the API layer clears the session and
  `AdminRoot` navigates to `login?redirect=<page>&reason=expired`; the login page says the session ended.
- Redirect after login: `safeReturnPath(locale, redirect)` accepts only a path inside `/{locale}/admin`, resolves `..`,
  never returns to the login page, and moves the other language's admin path into the current language.
- The no-access page (`/admin/forbidden`) is for a signed-in user without the right. A 403 from an API call is a
  toast with the backend's message; a 403 on a list shows the "no access" text instead of a retry button.
- Add a resource: a group in `PERMS`, the guard in the route, `permission` on the nav item, `<Can>` on the buttons,
  and the same checks in `mocks/handlers.ts`.
