import { decodeJwt } from '@/lib/jwt';
import { tokenService } from '@/services/token.service';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import type { AccessTokenPayload } from '@/types/auth';

let refreshPromise: Promise<string | null> | null = null;
let refreshSessionId: number | null = null;
let refreshAbortController: AbortController | null = null;

async function doRefresh(
  sessionId: number,
  signal: AbortSignal,
): Promise<string | null> {
  const { refreshToken, setTokens } = useAuthStore.getState();
  if (!refreshToken) {
    return null;
  }
  try {
    const tokens = await tokenService.refresh(refreshToken, signal);
    // The session that started this refresh may have logged out or been
    // replaced by a different account while the request was in flight —
    // never write a stale session's tokens over the current one.
    if (useAuthStore.getState().sessionId !== sessionId) {
      return null;
    }
    setTokens(tokens.access, tokens.refresh);
    const payload = decodeJwt<AccessTokenPayload>(tokens.access);
    if (payload) {
      usePermissionStore.getState().setPermissions({
        roles: payload.roles ?? [],
        permissions: payload.permissions ?? [],
      });
      if (payload.tenant_id) {
        useAuthStore.getState().setTenantId(payload.tenant_id);
      }
    }
    return tokens.access;
  } catch {
    // Every failure (rejected token, network, timeout, 5xx, cancellation)
    // resolves null. The caller decides what that means for the session.
    return null;
  }
}

/**
 * Refresh the session tokens. Resolves with the new access token, or null
 * when the refresh did not produce a session (no refresh token, rejected
 * token, network/5xx failure, cancellation, or a session replaced mid-flight).
 * Never rejects. The caller decides what null means (the private client logs out).
 * Safe to call outside React (axios interceptors).
 */
export function refreshAccessToken(): Promise<string | null> {
  const currentSessionId = useAuthStore.getState().sessionId;
  if (refreshPromise && refreshSessionId === currentSessionId) {
    return refreshPromise;
  }
  const controller = new AbortController();
  refreshAbortController = controller;
  refreshSessionId = currentSessionId;
  const promise = doRefresh(currentSessionId, controller.signal).finally(() => {
    // Identity-checked: a stale refresh settling late must not erase the
    // bookkeeping of a newer in-flight refresh.
    if (refreshPromise === promise) {
      refreshPromise = null;
      refreshSessionId = null;
    }
    if (refreshAbortController === controller) {
      refreshAbortController = null;
    }
  });
  refreshPromise = promise;
  return promise;
}

/** Aborts an in-flight refresh request. Called on logout so a pending
 * refresh can't resolve after the session is gone. */
export function cancelPendingRefresh(): void {
  refreshAbortController?.abort();
}
