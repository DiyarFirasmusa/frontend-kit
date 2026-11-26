import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { usePermissionStore } from './permission-store';

export type AdminUser = { id: string; username: string; name: string };

type AuthState = {
  user: AdminUser | null;
  accessToken: string | null;
  setSession: (session: { user: AdminUser; accessToken: string }) => void;
  setUser: (user: AdminUser) => void;
  clear: () => void;
};

/**
 * The admin session. sessionStorage, not localStorage: closing the tab signs out, and nothing outlives the
 * browser session. A real backend can move the token into an HttpOnly cookie (see STRUCTURE.md).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setSession: ({ user, accessToken }) => {
        set({ user, accessToken });
      },
      setUser: (user) => {
        set({ user });
      },
      clear: () => {
        set({ user: null, accessToken: null });
        usePermissionStore.getState().clear();
      },
    }),
    { name: 'admin-auth', storage: createJSONStorage(() => sessionStorage) },
  ),
);

export function isSignedIn(): boolean {
  const { user, accessToken } = useAuthStore.getState();
  return user !== null && accessToken !== null;
}
