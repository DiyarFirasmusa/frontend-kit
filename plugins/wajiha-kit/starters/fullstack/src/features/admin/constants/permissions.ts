/**
 * Every permission string the admin checks, in the `<resource>:<action>` shape the backend sends at
 * login. Group by resource; add a resource here when its feature is added, and mirror the backend's names.
 *
 *  - Route guard:  requirePermission(locale, PERMS.x.y) in a route's beforeLoad
 *  - JSX:          <Can permission={PERMS.x.y}> or useCan(PERMS.x.y)
 *
 * The `admin` role passes every check. The backend still decides; these checks only hide what the user
 * cannot do.
 */
export const PERMS = {
  supplier: {
    read: 'supplier:read',
    write: 'supplier:write',
    delete: 'supplier:delete',
  },
} as const;

type PermissionGroup = keyof typeof PERMS;

/** Union of every permission string above. */
export type Permission = {
  [G in PermissionGroup]: (typeof PERMS)[G][keyof (typeof PERMS)[G]];
}[PermissionGroup];

/** Role that passes every permission check. */
export const SUPER_ROLE = 'admin';

export const ALL_PERMISSIONS: readonly Permission[] = Object.values(PERMS).flatMap((group) =>
  Object.values(group),
);
