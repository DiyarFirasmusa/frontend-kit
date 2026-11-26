import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SUPER_ROLE, type Permission } from '../constants/permissions';

type PermissionState = {
  roles: string[];
  permissions: string[];
  setPermissions: (data: { roles?: string[] | null; permissions?: string[] | null }) => void;
  clear: () => void;
};

/** What the signed-in user may do. Kept for the browser tab (sessionStorage), like the session itself. */
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
    { name: 'admin-permissions', storage: createJSONStorage(() => sessionStorage) },
  ),
);

type Grants = { roles?: string[]; permissions?: string[] };

export function isGranted(state: Grants, permission: Permission): boolean {
  // Persisted state from an older version can lack either list.
  return (state.roles ?? []).includes(SUPER_ROLE) || (state.permissions ?? []).includes(permission);
}

/** For guards and event handlers. In JSX use useHasPermission or <Can>, which re-render on change. */
export function hasPermission(permission: Permission): boolean {
  return isGranted(usePermissionStore.getState(), permission);
}

export function useHasPermission(permission: Permission): boolean {
  return usePermissionStore((state) => isGranted(state, permission));
}

export function useHasAnyPermission(permissions: readonly Permission[]): boolean {
  return usePermissionStore((state) =>
    permissions.some((permission) => isGranted(state, permission)),
  );
}
