# Permissions

Who can see and do what. The backend always has the last word: these checks only
hide what a user cannot do, they never replace the server's check.

A permission is a string like `supplier:update` (`<resource>:<action>`). The user's
access token carries the list. The role `SUPERADMIN` passes every check.

All strings live in one place: `src/constants/permissions.ts` (`PERMS`).
`src/constants/permissions.test.ts` checks their shape, and
`src/routes/route-guards.test.ts` fails when a page route has no guard or a page
is missing from the table below.

## The four layers

Use all four for every page. Each one does a different job.

| Layer                      | Where                                               | How                                                                                                        | What it does                                                |
| -------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1. Sidebar                 | `src/layout/dashboard/sidebar/config/nav-config.ts` | `permission: PERMS.x.view` or `permissions: [..]` (any one) on an item or group                            | Hides the link. A group with no visible item is hidden too. |
| 2. Route                   | `src/routes/_app/**`                                | `beforeLoad: () => { requirePermission(PERMS.x.view); }`                                                   | Sends the user to `/403` when they open the URL by hand.    |
| 3. Tabs and sections       | inside the page                                     | `useCan(PERMS.x.view)` or `<Can permission={...}>`                                                         | Hides a tab or panel the user may not read.                 |
| 4. Buttons and row actions | `hooks/<entity>-actions.ts`, JSX                    | `<Can>` / `useCan()` in render; `can` passed into `*-actions.ts`; `hasPermission()` only in event handlers | Hides create, edit and delete.                              |

`PERMS` keys are `view`, `create`, `update`, `delete`; the values are the backend's
strings. Checks in render must be reactive (a refresh can change the list):
`useCan()` returns a `can(permission)` function that re-renders on change; pass it
to the pure `get<X>RowActions(row, { can, ... })` helpers.

In JSX use `<Can>` (`src/components/auth/can.tsx`):

```tsx
<Can permission={PERMS.supplier.create}>
  <Button>Add supplier</Button>
</Can>

<Can anyOf={[PERMS.supplier.update, PERMS.supplier.delete]} fallback={null}>
  <RowMenu />
</Can>
```

## Page by page

| Page                                              | Route                      | Route guard                 | Buttons and tabs                                                                                |
| ------------------------------------------------- | -------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| Home                                              | `/`                        | signed in only              | each KPI card and recent-change row: its resource's `:read`; activity chart: all four `:read`   |
| Warehouses                                        | `/warehouses`              | `warehouse:read`            | add: `warehouse:create`; edit: `warehouse:update`; delete: `warehouse:delete`                   |
| Warehouse details                                 | `/warehouses/$warehouseId` | `warehouse:read`            | edit and members: `warehouse:update`; delete: `warehouse:delete`; change log: `audit_log:read`  |
| Suppliers                                         | `/suppliers`               | `supplier:read`             | add: `supplier:create`; edit: `supplier:update`; delete: `supplier:delete`                      |
| Categories                                        | `/categories`              | `item_category:read`        | add: `item_category:create`; edit: `:update`; delete: `:delete`                                 |
| Attributes (second tab of the categories feature) | `/attributes`              | `attribute_definition:read` | add: `attribute_definition:create`; edit: `:update`; delete: `:delete`                          |
| Units of measure                                  | `/units-of-measure`        | `unit_of_measure:read`      | add: `unit_of_measure:create`; edit: `unit_of_measure:update`; delete: `unit_of_measure:delete` |

Home is open to any signed-in user, so it applies layer 3 itself: a card or a recent
change of a resource the user cannot read is not rendered, and with no read permission
at all the page says so and fetches nothing. The backend's `/overview/*` endpoints
must filter the same way; the client check only hides.

## Adding a resource

1. Add its group to `PERMS` in `src/constants/permissions.ts`.
2. Put `requirePermission(PERMS.<resource>.view)` in the route's `beforeLoad`.
3. Put `permission: PERMS.<resource>.view` on its item in `nav-config.ts`.
4. Gate create, edit and delete with `<Can>` / `useCan()` or `<entity>-actions.ts`.
5. Add the page to the table above.
6. If the backend does not publish the permission yet, say so here instead of
   inventing a name:

   > Waiting on the backend: `report:export` is not issued yet.
