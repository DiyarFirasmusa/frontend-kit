import { useAuthStore } from '@/store/auth-store';
import { cancelPendingRefresh } from './refresh-token';

/**
 * The API layer cannot import the router or the query client's owners without
 * a cycle, so the session layer registers what to do here at boot
 * (src/features/auth/session). With nothing registered (unit tests, a boot
 * error) an expired session falls back to a full page load of /login.
 */
export interface SessionHooks {
  /** The session is over and the auth and permission stores are cleared. */
  onSessionExpired?: () => void;
  /** A 403 from the API: the user's permissions may have changed server-side. */
  onForbidden?: () => void;
}

let hooks: SessionHooks = {};

export function registerSessionHooks(next: SessionHooks): () => void {
  hooks = next;
  return () => {
    if (hooks === next) {
      hooks = {};
    }
  };
}

/** `/login?redirect=<where the user was>`, for the no-router fallback. */
function loginHref(): string {
  const { pathname, search, hash } = window.location;
  if (pathname.startsWith('/login')) {
    return '/login';
  }
  return `/login?redirect=${encodeURIComponent(pathname + search + hash)}`;
}

/**
 * End the session `sessionId` names, once. Every request that got a 401 from
 * the same session calls this; the first one clears and navigates, the rest
 * see a newer session id and do nothing.
 */
export function expireSession(sessionId: number): void {
  const auth = useAuthStore.getState();
  if (auth.sessionId !== sessionId) {
    return;
  }
  cancelPendingRefresh();
  auth.clear();
  if (hooks.onSessionExpired) {
    hooks.onSessionExpired();
  } else if (typeof window !== 'undefined') {
    window.location.assign(loginHref());
  }
}

export function notifyForbidden(): void {
  hooks.onForbidden?.();
}
