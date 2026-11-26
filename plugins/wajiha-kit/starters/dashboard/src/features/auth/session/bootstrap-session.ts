import {
  adoptRefreshedTokens,
  refreshAccessToken,
  tokenHasPermissionClaims,
} from '@/api/auth/refresh-token';
import { expireSession } from '@/api/auth/session-hooks';
import {
  onSessionMessage,
  startSessionSync,
  type SessionMessage,
} from '@/api/auth/session-sync';
import { qk } from '@/constants/query-keys';
import { env } from '@/env';
import { decodeJwt } from '@/lib/jwt';
import { queryClient } from '@/lib/query-client';
import { fetchMe } from '@/services/me.service';
import { AUTH_STORAGE_KEY, useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';

/* Older builds kept both tokens and the permissions in localStorage. */
const LEGACY_LOCAL_KEYS = [AUTH_STORAGE_KEY, 'app-permissions'];

function removeLegacyStorage(): void {
  try {
    for (const key of LEGACY_LOCAL_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    // Storage can be blocked (privacy mode); nothing to clean then.
  }
}

/**
 * Load roles and permissions from `/me` and seed its query, so the shell's
 * `useMe` does not ask again. A failure leaves the permissions empty: the
 * nav hides what it cannot confirm, and the backend still decides.
 */
export async function restorePermissionsFromMe(): Promise<void> {
  try {
    const me = await fetchMe({ silentError: true });
    usePermissionStore.getState().setPermissions({
      roles: me.roles,
      permissions: me.permissions,
    });
    queryClient.setQueryData(qk.me.all, me);
  } catch {
    // See above: an empty permission set is the safe default.
  }
}

/** Cookie mode in a fresh tab has no stored user; the token names one. */
function ensureUser(access: string): void {
  const auth = useAuthStore.getState();
  if (auth.user) {
    return;
  }
  const claims = decodeJwt(access);
  auth.setUser({ id: claims?.sub ?? '', username: '' });
}

function handleSessionMessage(message: SessionMessage): void {
  if (message.type === 'refreshed') {
    adoptRefreshedTokens(message);
    return;
  }
  const auth = useAuthStore.getState();
  if (auth.user || auth.accessToken) {
    expireSession(auth.sessionId);
  }
}

let stopListening: (() => void) | null = null;

/**
 * Runs once before the router mounts (main.tsx). The access token lives in
 * memory, so after a reload it is gone: one refresh brings it back when a
 * refresh token (session mode) or cookie (cookie mode) may exist, then the
 * permissions come from the new token, or from `/me` when it has no claims.
 */
export async function bootstrapSession(): Promise<void> {
  removeLegacyStorage();
  startSessionSync();
  stopListening ??= onSessionMessage(handleSessionMessage);

  const auth = useAuthStore.getState();
  const mayHaveSession =
    env.VITE_AUTH_REFRESH === 'cookie' || auth.refreshToken !== null;
  if (!mayHaveSession) {
    if (auth.user) {
      auth.clear();
    }
    return;
  }

  const result = await refreshAccessToken(null);
  if (result.status === 'rejected') {
    useAuthStore.getState().clear();
    return;
  }
  if (result.status === 'unavailable') {
    // Keep the stored refresh token: the guards send the user to /login now,
    // and the next reload tries again once the backend answers.
    return;
  }
  ensureUser(result.token);
  if (!tokenHasPermissionClaims(result.token)) {
    await restorePermissionsFromMe();
  }
}
