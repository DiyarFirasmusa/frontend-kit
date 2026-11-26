/**
 * Every permission string the UI checks, in the `<resource>:<action>` shape the
 * access token's `permissions` claim carries. Group by resource with the keys
 * view / create / update / delete; the values must be the backend's exact
 * strings (when it has one `write` for create and update, map both keys to it).
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
    view: 'warehouse:read',
    create: 'warehouse:create',
    update: 'warehouse:update',
    delete: 'warehouse:delete',
  },
  supplier: {
    view: 'supplier:read',
    create: 'supplier:create',
    update: 'supplier:update',
    delete: 'supplier:delete',
  },
  unitOfMeasure: {
    view: 'unit_of_measure:read',
    create: 'unit_of_measure:create',
    update: 'unit_of_measure:update',
    delete: 'unit_of_measure:delete',
  },
  itemCategory: {
    view: 'item_category:read',
    create: 'item_category:create',
    update: 'item_category:update',
    delete: 'item_category:delete',
  },
  attributeDefinition: {
    view: 'attribute_definition:read',
    create: 'attribute_definition:create',
    update: 'attribute_definition:update',
    delete: 'attribute_definition:delete',
  },
  auditLog: {
    view: 'audit_log:read',
  },
} as const;

export type PermissionGroup = keyof typeof PERMS;

/** Union of every permission string above. */
export type Permission = {
  [G in PermissionGroup]: (typeof PERMS)[G][keyof (typeof PERMS)[G]];
}[PermissionGroup];
