import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/common';
import { usePermissionStore } from './permission-store';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  /**
   * Bumped on every login and logout/clear. Lets an in-flight token refresh
   * detect that the session it started for is no longer the current one
   * (a race with logout or an account switch) and discard its result
   * instead of overwriting a newer or cleared session.
   */
  sessionId: number;
  setUser: (user: User | null) => void;
  setSession: (session: {
    user: User;
    accessToken: string;
    refreshToken: string;
    tenantId: string | null;
  }) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setTenantId: (tenantId: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      tenantId: null,
      sessionId: 0,
      setUser: (user) => {
        set({ user });
      },
      setSession: ({ user, accessToken, refreshToken, tenantId }) => {
        set((state) => ({
          user,
          accessToken,
          refreshToken,
          tenantId,
          sessionId: state.sessionId + 1,
        }));
      },
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },
      setTenantId: (tenantId) => {
        set({ tenantId });
      },
      clear: () => {
        set((state) => ({
          user: null,
          accessToken: null,
          refreshToken: null,
          tenantId: null,
          sessionId: state.sessionId + 1,
        }));
        usePermissionStore.getState().clear();
      },
    }),
    {
      name: 'app-auth',
    },
  ),
);
