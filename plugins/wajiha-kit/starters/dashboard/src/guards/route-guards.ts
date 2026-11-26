import { redirect } from '@tanstack/react-router';
import type { Permission } from '@/constants/permissions';
import { useAuthStore } from '@/store/auth-store';
import { hasPermission } from '@/store/permission-store';

/**
 * `location` is the one `beforeLoad` receives. With it, /login gets
 * `?redirect=<href>` so signing in again returns the user to where they were
 * (home needs no parameter: login lands there anyway).
 */
export function requireAuth(location?: { href: string }) {
  const { accessToken, user } = useAuthStore.getState();
  if (!accessToken || !user) {
    const href = location?.href;
    throw redirect({
      to: '/login',
      search: href && href !== getHomePath() ? { redirect: href } : {},
    });
  }
}

export function getHomePath(): '/' {
  return '/';
}

export function requireGuest() {
  if (useAuthStore.getState().accessToken) {
    throw redirect({ to: getHomePath() });
  }
}

export function requirePermission(permission: Permission) {
  requireAuth();
  if (!hasPermission(permission)) {
    throw redirect({ to: '/403' });
  }
}

const ORIGIN_PROBE = 'http://app.invalid';

/**
 * The `redirect` search value is attacker-controlled (anyone can send a
 * /login link). Return it only when it is a path inside this app; anything
 * else (`//host`, `/\host`, a scheme, /login itself) becomes the home path.
 */
export function safeRedirect(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\')
  ) {
    return getHomePath();
  }
  let url: URL;
  try {
    url = new URL(value, ORIGIN_PROBE);
  } catch {
    return getHomePath();
  }
  if (url.origin !== ORIGIN_PROBE || /^\/login(?:\/|$)/.test(url.pathname)) {
    return getHomePath();
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
