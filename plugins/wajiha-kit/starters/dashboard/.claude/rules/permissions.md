---
paths:
  - 'src/constants/permissions.ts'
  - 'src/components/auth/**'
  - 'src/guards/**'
  - 'src/store/permission-store.ts'
  - 'src/layout/dashboard/sidebar/**'
  - 'src/routes/_app/**'
  - 'src/features/**/hooks/*-actions.ts'
  - 'PERMISSIONS.md'
---

# Permissions

A permission is a string `<resource>:<action>` (`supplier:update`) carried by the
access token. All strings are in `PERMS` (`src/constants/permissions.ts`), grouped
by resource with the keys `view`, `create`, `update`, `delete`; the values are the
backend's exact strings. `SUPERADMIN` passes every check. The backend still decides:
these checks only hide what a user cannot do.

Use all four layers on every page:

1. **Sidebar**: `permission: PERMS.x.view` (or `permissions: [...]`, any one) on the
   item in `nav-config.ts`.
2. **Route**: `beforeLoad: () => { requirePermission(PERMS.x.view); }` sends the user to `/403`.
3. **Tabs and sections**: `useCan(PERMS.x.view)` or `<Can permission={...}>`. This
   includes widgets that show other resources' data: Home gates each KPI card and
   each recent-change row on its resource's read permission (`getHomeAccess`,
   `filterReadableChanges` in `features/dashboard/home/hooks/home-access.ts`) and the
   activity chart (which counts every kind with no split) on all of them. A new
   resource on Home adds its line there.
4. **Buttons and row actions**: `useCan()` returns a reactive `can(permission)`;
   pass it into the pure `getXRowActions(row, { can, ... })`. `hasPermission()` is
   for event handlers only, never render (a token refresh can change the list).

Row actions:

- No permission: the action is not rendered.
- Allowed in general but refused for this row (a supplier on documents cannot be
  deleted): render it with `disabledReason` (`aria-disabled` plus the reason as text);
  selecting it sends nothing. Test that a click makes no request.
- Create buttons use `can(PERMS.x.create)`; they are also the empty-state action.

Adding a resource: add its group to `PERMS`, guard the route, gate the nav item and
the actions, add a row to the table in `PERMISSIONS.md` (`route-guards.test.ts` fails
without it). If the backend does not issue a permission yet, say so in
`PERMISSIONS.md` instead of inventing a name. Test the "view only" case for every
list: no create, edit or delete is rendered.
