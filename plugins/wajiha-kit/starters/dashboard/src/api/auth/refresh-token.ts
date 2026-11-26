import { env } from '@/env';
import { decodeJwt } from '@/lib/jwt';
import { tokenService } from '@/services/token.service';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import { getErrorStatus } from '../error/utils/http';
import { postSessionMessage, type SessionMessage } from './session-sync';

/**
 * - `ok`: a new access token is in the store.
 * - `rejected`: the backend refused the refresh token (or there is none). Only
 *   this ends the session.
 * - `unavailable`: network, timeout, 5xx, cancellation, or the session changed
 *   meanwhile. The session stays; the caller fails its own request.
 */
export type RefreshResult =
  | { status: 'ok'; token: string }
  | { status: 'rejected' }
  | { status: 'unavailable' };

const REJECTED: RefreshResult = { status: 'rejected' };
const UNAVAILABLE: RefreshResult = { status: 'unavailable' };

/** Statuses from the refresh endpoint that mean "this token is no good". */
const REJECTING_STATUSES = new Set([400, 401, 403]);

/** One name for every tab, so only one of them refreshes at a time. */
const REFRESH_LOCK = 'auth-refresh';

let refreshPromise: Promise<RefreshResult> | null = null;
let refreshSessionId: number | null = null;
let refreshAbortController: AbortController | null = null;

/**
 * Store a token pair and what it says about the user. Permissions are
 * replaced only when the token carries the claims: a backend that sends them
 * in the login body alone must not lose them on the first refresh.
 */
export function applyTokens(access: string, refresh: string | null): void {
  const auth = useAuthStore.getState();
  auth.setTokens(access, refresh);
  const claims = decodeJwt(access);
  if (!claims) {
    return;
  }
  if (Array.isArray(claims.roles) || Array.isArray(claims.permissions)) {
    const current = usePermissionStore.getState();
    current.setPermissions({
      roles: claims.roles ?? current.roles,
      permissions: claims.permissions ?? current.permissions,
    });
  }
  if (claims.tenant_id) {
    auth.setTenantId(claims.tenant_id);
  }
}

/** True when the token carries roles or permissions claims. */
export function tokenHasPermissionClaims(access: string): boolean {
  const claims = decodeJwt(access);
  return Array.isArray(claims?.roles) || Array.isArray(claims?.permissions);
}

function classifyFailure(error: unknown): RefreshResult {
  const status = getErrorStatus(error);
  return status !== undefined && REJECTING_STATUSES.has(status)
    ? REJECTED
    : UNAVAILABLE;
}

/** Runs `task` under the cross-tab lock where Web Locks exist (not jsdom). */
async function withRefreshLock(
  task: () => Promise<RefreshResult>,
): Promise<RefreshResult> {
  if (typeof navigator === 'undefined' || !('locks' in navigator)) {
    return task();
  }
  const result: RefreshResult = await navigator.locks.request(
    REFRESH_LOCK,
    task,
  );
  return result;
}

async function doRefresh(
  sessionId: number,
  staleToken: string | null,
  signal: AbortSignal,
): Promise<RefreshResult> {
  return withRefreshLock(async () => {
    const auth = useAuthStore.getState();
    if (auth.sessionId !== sessionId || signal.aborted) {
      return UNAVAILABLE;
    }
    // Another tab refreshed while this one waited for the lock, and its token
    // was adopted (adoptRefreshedTokens). Refreshing again would send a
    // refresh token that rotation has already revoked.
    if (auth.accessToken && auth.accessToken !== staleToken) {
      return { status: 'ok', token: auth.accessToken };
    }
    const usedRefresh = auth.refreshToken;
    if (env.VITE_AUTH_REFRESH === 'session' && !usedRefresh) {
      return REJECTED;
    }
    try {
      const tokens = await tokenService.refresh(usedRefresh, signal);
      // The session that started this refresh may have logged out or been
      // replaced by a different account while the request was in flight —
      // never write a stale session's tokens over the current one.
      if (useAuthStore.getState().sessionId !== sessionId) {
        return UNAVAILABLE;
      }
      applyTokens(tokens.access, tokens.refresh ?? null);
      postSessionMessage({
        type: 'refreshed',
        access: tokens.access,
        refresh: useAuthStore.getState().refreshToken,
        previousRefresh: usedRefresh,
        userId: decodeJwt(tokens.access)?.sub ?? null,
      });
      return { status: 'ok', token: tokens.access };
    } catch (error) {
      return classifyFailure(error);
    }
  });
}

/**
 * Refresh the session tokens, once per tab however many requests ask
 * (single-flight) and once across tabs (Web Locks + BroadcastChannel).
 * Never rejects. Safe to call outside React (axios interceptors).
 *
 * `staleToken` is the access token the failed request carried. When the
 * store already holds a different one, it is returned without a request:
 * a late 401 from before the last refresh must not trigger another.
 */
export function refreshAccessToken(
  staleToken?: string | null,
): Promise<RefreshResult> {
  const auth = useAuthStore.getState();
  const stale = staleToken === undefined ? auth.accessToken : staleToken;
  if (auth.accessToken && auth.accessToken !== stale) {
    return Promise.resolve({ status: 'ok', token: auth.accessToken });
  }
  if (refreshPromise && refreshSessionId === auth.sessionId) {
    return refreshPromise;
  }
  // A refresh still running for a previous session is worthless; abort it so
  // it releases the cross-tab lock instead of making this one wait.
  refreshAbortController?.abort();
  const controller = new AbortController();
  refreshAbortController = controller;
  refreshSessionId = auth.sessionId;
  const promise = doRefresh(auth.sessionId, stale, controller.signal).finally(
    () => {
      // Identity-checked: a stale refresh settling late must not erase the
      // bookkeeping of a newer in-flight refresh.
      if (refreshPromise === promise) {
        refreshPromise = null;
        refreshSessionId = null;
      }
      if (refreshAbortController === controller) {
        refreshAbortController = null;
      }
    },
  );
  refreshPromise = promise;
  return promise;
}

/** Aborts an in-flight refresh request. Called on logout so a pending
 * refresh can't resolve after the session is gone. */
export function cancelPendingRefresh(): void {
  refreshAbortController?.abort();
}

/**
 * Take over the tokens another tab just got, when they continue this tab's
 * session: the same refresh token in session mode, the same user in cookie
 * mode (where every tab shares the cookie).
 */
export function adoptRefreshedTokens(
  message: Extract<SessionMessage, { type: 'refreshed' }>,
): void {
  const auth = useAuthStore.getState();
  if (!auth.user) {
    return;
  }
  const continuesSession =
    env.VITE_AUTH_REFRESH === 'cookie'
      ? message.userId === null || message.userId === auth.user.id
      : auth.refreshToken !== null &&
        message.previousRefresh === auth.refreshToken;
  if (continuesSession) {
    applyTokens(message.access, message.refresh);
  }
}
