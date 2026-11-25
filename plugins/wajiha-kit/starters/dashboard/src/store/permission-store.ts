import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Permission } from '@/constants/permissions';

/** Role that bypasses every permission check. */
const SUPERADMIN_ROLE = 'SUPERADMIN';

interface PermissionState {
  roles: string[];
  permissions: string[];
  setPermissions: (data: {
    roles?: string[] | null;
    permissions?: string[] | null;
  }) => void;
  clear: () => void;
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set) => ({
      roles: [],
      permissions: [],
      setPermissions: ({ roles, permissions }) => {
        set({ roles: roles ?? [], permissions: permissions ?? [] });
      },
      clear: () => {
        set({ roles: [], permissions: [] });
      },
    }),
    {
      name: 'app-permissions',
    },
  ),
);

function isGranted(
  state: { roles?: string[]; permissions?: string[] },
  permission: Permission,
): boolean {
  /* Persisted state from an older session can lack either list. */
  return (
    (state.roles ?? []).includes(SUPERADMIN_ROLE) ||
    (state.permissions ?? []).includes(permission)
  );
}

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
