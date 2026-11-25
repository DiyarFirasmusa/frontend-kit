import { useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Permission } from '@/constants/permissions';
import { hasPermission, usePermissionStore } from '@/store/permission-store';
import { NAV_GROUPS } from '../config/nav-config';
import type { NavGroup } from '../types/types';

function isUnder(prefix: string, path: string): boolean {
  if (prefix === '/') {
    return path === '/';
  }
  return path === prefix || path.startsWith(prefix + '/');
}

/**
 * Length of the longest prefix (`to` or one of `matches`) the path sits under,
 * or -1 when the item does not own the path.
 */
export function itemMatchLength(
  item: { to: string; matches?: readonly string[] },
  path: string,
): number {
  return [item.to, ...(item.matches ?? [])].reduce(
    (best, prefix) =>
      isUnder(prefix, path) && prefix.length > best ? prefix.length : best,
    -1,
  );
}

export function isItemActive(
  item: { to: string; matches?: readonly string[] },
  path: string,
) {
  return itemMatchLength(item, path) >= 0;
}

/**
 * Filters the nav tree through the store's permission rule. Subscribes to the
 * roles and permissions snapshot so the result re-computes when the session
 * changes; the store's `hasPermission` reads the same state synchronously.
 */
export function useVisibleNavGroups(
  source: readonly NavGroup[] = NAV_GROUPS,
): NavGroup[] {
  const { roles, permissions } = usePermissionStore(
    useShallow((s) => ({ roles: s.roles, permissions: s.permissions })),
  );

  return useMemo(() => {
    const isGranted = (rule: {
      permission?: Permission;
      permissions?: readonly Permission[];
    }) =>
      rule.permissions
        ? rule.permissions.some((permission) => hasPermission(permission))
        : rule.permission === undefined || hasPermission(rule.permission);

    return source
      .filter((group) => isGranted(group))
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => isGranted(item)),
      }))
      .filter((group) => group.items.length > 0);
  }, [source, roles, permissions]);
}

export function useSidebar() {
  const { location } = useRouterState();

  return { path: location.pathname };
}
