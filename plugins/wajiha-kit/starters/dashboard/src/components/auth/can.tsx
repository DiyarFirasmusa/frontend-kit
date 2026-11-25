import type { ReactNode } from 'react';
import type { Permission } from '@/constants/permissions';
import { useHasPermission, usePermissionStore } from '@/store/permission-store';

/**
 * Show something only to users who hold a permission. Hiding is a courtesy; the
 * backend still decides. Pair every `<Can>` with a route guard on the page.
 *
 *   <Can permission={PERMS.supplier.write}>
 *     <Button>Add supplier</Button>
 *   </Can>
 *
 *   <Can anyOf={[PERMS.supplier.write, PERMS.supplier.delete]} fallback={<Hint />}>
 *     ...
 *   </Can>
 */
export type CanProps = { children: ReactNode; fallback?: ReactNode } & (
  | { permission: Permission; anyOf?: never }
  | { anyOf: readonly Permission[]; permission?: never }
);

const SUPERADMIN_ROLE = 'SUPERADMIN';

/** Reactive check for one permission (same rules as `hasPermission`). */
export function useCan(permission: Permission): boolean {
  return useHasPermission(permission);
}

/** True when the user holds at least one of the permissions. */
export function useCanAny(permissions: readonly Permission[]): boolean {
  return usePermissionStore(
    (state) =>
      (state.roles ?? []).includes(SUPERADMIN_ROLE) ||
      permissions.some((permission) =>
        (state.permissions ?? []).includes(permission),
      ),
  );
}

export function Can({ children, fallback = null, ...rule }: CanProps) {
  const single = useCan(rule.permission ?? ('' as Permission));
  const any = useCanAny(rule.anyOf ?? []);
  const allowed = rule.anyOf ? any : rule.permission ? single : false;
  return allowed ? children : fallback;
}
