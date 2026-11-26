import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { env } from '@/env';
import type { User } from '@/types/common';
import { usePermissionStore } from './permission-store';

/** sessionStorage key of the part of the session that survives a reload. */
export const AUTH_STORAGE_KEY = 'app-auth';

/**
 * In cookie mode the backend owns the refresh token (HttpOnly cookie), so a
 * token that still arrives in a response body is dropped rather than kept
 * where scripts can read it.
 */
function keepableRefreshToken(token: string | null): string | null {
  return env.VITE_AUTH_REFRESH === 'cookie' ? null : token;
}

interface AuthState {
  user: User | null;
  /** Memory only: never persisted, restored by one refresh at boot. */
  accessToken: string | null;
  /** Session mode only (sessionStorage). Always null in cookie mode. */
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
    refreshToken: string | null;
    tenantId: string | null;
  }) => void;
  setTokens: (accessToken: string, refreshToken: string | null) => void;
  setTenantId: (tenantId: string) => void;
  clear: () => void;
}

type PersistedAuth = Pick<AuthState, 'user' | 'refreshToken' | 'tenantId'>;

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
          refreshToken: keepableRefreshToken(refreshToken),
          tenantId,
          sessionId: state.sessionId + 1,
        }));
      },
      setTokens: (accessToken, refreshToken) => {
        set((state) => ({
          accessToken,
          // A cookie backend may answer a refresh without a body token: keep
          // the one we have instead of losing the session on the next reload.
          refreshToken: keepableRefreshToken(
            refreshToken ?? state.refreshToken,
          ),
        }));
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
      name: AUTH_STORAGE_KEY,
      // sessionStorage, never localStorage: it dies with the tab and is not
      // shared, so another tab cannot keep using a token this one rotated.
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state): PersistedAuth => ({
        user: state.user,
        refreshToken: keepableRefreshToken(state.refreshToken),
        tenantId: state.tenantId,
      }),
    },
  ),
);
