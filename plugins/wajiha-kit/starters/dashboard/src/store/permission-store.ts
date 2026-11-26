import { create } from 'zustand';
import type { Permission } from '@/constants/permissions';

/** Role that bypasses every permission check. */
const SUPERADMIN_ROLE = 'SUPERADMIN';

export interface PermissionSnapshot {
  roles: readonly string[];
  permissions: readonly string[];
}

interface PermissionState extends PermissionSnapshot {
  roles: string[];
  permissions: string[];
  setPermissions: (data: {
    roles?: string[] | null;
    permissions?: string[] | null;
  }) => void;
  clear: () => void;
}

/**
 * Memory only. Permissions are rebuilt at boot from the refreshed token or
 * `/me` (see bootstrapSession), so nothing a script could edit in storage
 * ever decides what the UI shows.
 */
export const usePermissionStore = create<PermissionState>()((set) => ({
  roles: [],
  permissions: [],
  setPermissions: ({ roles, permissions }) => {
    set({ roles: roles ?? [], permissions: permissions ?? [] });
  },
  clear: () => {
    set({ roles: [], permissions: [] });
  },
}));

/** The one place that knows the super-admin rule. */
export function isGranted(
  state: PermissionSnapshot,
  permission: Permission,
): boolean {
  return (
    state.roles.includes(SUPERADMIN_ROLE) ||
    state.permissions.includes(permission)
  );
}

/** Reads the store once: for guards and event handlers, never for render. */
export function hasPermission(permission: Permission): boolean {
  return isGranted(usePermissionStore.getState(), permission);
}

/**
 * Reactive permission check for use during render. `hasPermission()` reads
 * `getState()` once and never triggers a re-render on its own — fine inside
 * route guards and event handlers, but a component that calls it directly
 * in its body will keep showing a stale answer until something else causes
 * it to re-render (e.g. a session refresh that changes permissions while
 * the page stays open). Use this hook wherever the result gates JSX.
 */
export function useHasPermission(permission: Permission): boolean {
  return usePermissionStore((s) => isGranted(s, permission));
}
