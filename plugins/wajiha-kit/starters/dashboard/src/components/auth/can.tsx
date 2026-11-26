import { useCallback, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Permission } from '@/constants/permissions';
import { isGranted, usePermissionStore } from '@/store/permission-store';

/**
 * Show something only to users who hold a permission. Hiding is a courtesy; the
 * backend still decides. Pair every `<Can>` with a route guard on the page.
 *
 *   <Can permission={PERMS.supplier.create}>
 *     <Button>Add supplier</Button>
 *   </Can>
 *
 *   <Can anyOf={[PERMS.supplier.update, PERMS.supplier.delete]} fallback={<Hint />}>
 *     ...
 *   </Can>
 */
export type CanProps = { children: ReactNode; fallback?: ReactNode } & (
  | { permission: Permission; anyOf?: never }
  | { anyOf: readonly Permission[]; permission?: never }
);

export type CanCheck = (permission: Permission) => boolean;

/**
 * Reactive permission checker for render code. `useCan()` returns a `can`
 * function that changes identity whenever roles or permissions change, so a
 * `useMemo` that lists it rebuilds columns and row actions after a refresh.
 * Pass it into pure helpers (`getXRowActions({ can })`). `useCan(p)` is the
 * one-permission shorthand.
 */
export function useCan(): CanCheck;
export function useCan(permission: Permission): boolean;
export function useCan(permission?: Permission): CanCheck | boolean {
  const { roles, permissions } = usePermissionStore(
    useShallow((s) => ({ roles: s.roles, permissions: s.permissions })),
  );
  const can = useCallback<CanCheck>(
    (p) => isGranted({ roles, permissions }, p),
    [roles, permissions],
  );
  return permission === undefined ? can : can(permission);
}

/** True when the user holds at least one of the permissions. */
export function useCanAny(permissions: readonly Permission[]): boolean {
  const can = useCan();
  return permissions.some((permission) => can(permission));
}

export function Can({ children, fallback = null, ...rule }: CanProps) {
  const can = useCan();
  const allowed = rule.anyOf
    ? rule.anyOf.some(can)
    : rule.permission
      ? can(rule.permission)
      : false;
  return allowed ? children : fallback;
}
