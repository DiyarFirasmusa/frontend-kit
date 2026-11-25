# Permissions

Who can see and do what. The backend always has the last word: these checks only
hide what a user cannot do, they never replace the server's check.

A permission is a string like `supplier:write` (`<resource>:<action>`). The user's
access token carries the list. The role `SUPERADMIN` passes every check.

All strings live in one place: `src/constants/permissions.ts` (`PERMS`).
`src/constants/permissions.test.ts` checks their shape, and
`src/routes/route-guards.test.ts` fails when a page route has no guard or a page
is missing from the table below.

## The four layers

Use all four for every page. Each one does a different job.

| Layer                      | Where                                               | How                                                                             | What it does                                                |
| -------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1. Sidebar                 | `src/layout/dashboard/sidebar/config/nav-config.ts` | `permission: PERMS.x.read` or `permissions: [..]` (any one) on an item or group | Hides the link. A group with no visible item is hidden too. |
| 2. Route                   | `src/routes/_dashboard/**`                          | `beforeLoad: () => { requirePermission(PERMS.x.read); }`                        | Sends the user to `/403` when they open the URL by hand.    |
| 3. Tabs and sections       | inside the page                                     | `useCan(PERMS.x.read)` or `<Can permission={...}>`                              | Hides a tab or panel the user may not read.                 |
| 4. Buttons and row actions | `hooks/<entity>-actions.ts`, JSX                    | `<Can>` for JSX, `hasPermission()` in plain code                                | Hides create, edit and delete.                              |

In JSX use `<Can>` (`src/components/auth/can.tsx`):

```tsx
<Can permission={PERMS.supplier.write}>
  <Button>Add supplier</Button>
</Can>

<Can anyOf={[PERMS.supplier.write, PERMS.supplier.delete]} fallback={null}>
  <RowMenu />
</Can>
```

## Page by page

| Page                                              | Route                      | Route guard                 | Buttons and tabs                                                                              |
| ------------------------------------------------- | -------------------------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| Home                                              | `/`                        | signed in only              | none                                                                                          |
| Warehouses                                        | `/warehouses`              | `warehouse:read`            | add and edit: `warehouse:write`; delete: `warehouse:delete`                                   |
| Warehouse details                                 | `/warehouses/$warehouseId` | `warehouse:read`            | edit and members: `warehouse:write`; delete: `warehouse:delete`; change log: `audit_log:read` |
| Suppliers                                         | `/suppliers`               | `supplier:read`             | add and edit: `supplier:write`; delete: `supplier:delete`                                     |
| Categories                                        | `/categories`              | `item_category:read`        | add, edit, delete: `item_category:write` / `:delete`                                          |
| Attributes (second tab of the categories feature) | `/attributes`              | `attribute_definition:read` | add, edit, delete: `attribute_definition:write` / `:delete`                                   |
| Units of measure                                  | `/units-of-measure`        | `unit_of_measure:read`      | add and edit: `unit_of_measure:write`; delete: `unit_of_measure:delete`                       |

## Adding a resource

1. Add its group to `PERMS` in `src/constants/permissions.ts`.
2. Put `requirePermission(PERMS.<resource>.read)` in the route's `beforeLoad`.
3. Put `permission: PERMS.<resource>.read` on its item in `nav-config.ts`.
4. Gate create, edit and delete with `<Can>` or `<entity>-actions.ts`.
5. Add the page to the table above.
6. If the backend does not publish the permission yet, say so here instead of
   inventing a name:

   > Waiting on the backend: `report:export` is not issued yet.
