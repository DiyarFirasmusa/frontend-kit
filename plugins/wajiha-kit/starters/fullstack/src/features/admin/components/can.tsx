import type { ReactNode } from 'react';
import type { Permission } from '../constants/permissions';
import { useHasAnyPermission, useHasPermission } from '../store/permission-store';

/**
 * Show something only to users who hold a permission. Hiding is a courtesy; the backend still decides.
 * Pair every `<Can>` with a route guard on the page.
 *
 *   <Can permission={PERMS.supplier.write}>
 *     <Button>Add supplier</Button>
 *   </Can>
 *
 *   <Can anyOf={[PERMS.supplier.write, PERMS.supplier.delete]} fallback={<Hint />}>...</Can>
 */
export type CanProps = { children: ReactNode; fallback?: ReactNode } & (
  | { permission: Permission; anyOf?: never }
  | { anyOf: readonly Permission[]; permission?: never }
);

/** Reactive check for one permission. */
export function useCan(permission: Permission): boolean {
  return useHasPermission(permission);
}

export function Can({ children, fallback = null, permission, anyOf }: CanProps) {
  const list = anyOf ?? (permission === undefined ? [] : [permission]);
  const allowed = useHasAnyPermission(list);
  return allowed ? children : fallback;
}
