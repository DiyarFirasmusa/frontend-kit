/**
 * Every permission string the UI checks, in the `<resource>:<action>` shape the
 * access token's `permissions` claim carries. Group by resource; add a resource
 * here when its feature is added, and mirror the backend's real names.
 *
 *  - Route guard:  requirePermission(PERMS.x.y) in a route's beforeLoad
 *  - JSX:          <Can permission={PERMS.x.y}> or useCan(PERMS.x.y)
 *  - Hooks:        useHasPermission(PERMS.x.y), hasPermission(...) in plain code
 *
 * The SUPERADMIN role passes every check (see store/permission-store). The
 * backend still decides; these checks only hide what the user cannot do.
 * The page-by-page list lives in PERMISSIONS.md at the project root.
 */
export const PERMS = {
  warehouse: {
    read: 'warehouse:read',
    write: 'warehouse:write',
    delete: 'warehouse:delete',
  },
  supplier: {
    read: 'supplier:read',
    write: 'supplier:write',
    delete: 'supplier:delete',
  },
  unitOfMeasure: {
    read: 'unit_of_measure:read',
    write: 'unit_of_measure:write',
    delete: 'unit_of_measure:delete',
  },
  itemCategory: {
    read: 'item_category:read',
    write: 'item_category:write',
    delete: 'item_category:delete',
  },
  attributeDefinition: {
    read: 'attribute_definition:read',
    write: 'attribute_definition:write',
    delete: 'attribute_definition:delete',
  },
  auditLog: {
    read: 'audit_log:read',
  },
} as const;

export type PermissionGroup = keyof typeof PERMS;

/** Union of every permission string above. */
export type Permission = {
  [G in PermissionGroup]: (typeof PERMS)[G][keyof (typeof PERMS)[G]];
}[PermissionGroup];
