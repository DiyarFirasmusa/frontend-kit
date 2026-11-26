import { redirect } from '@tanstack/react-router';
import type { Locale } from '@/shared/lib/i18n/languages';
import type { Permission } from '../constants/permissions';
import { isSignedIn } from '../store/auth-store';
import { hasPermission } from '../store/permission-store';

// Route guards run in beforeLoad. The admin routes are client-only (ssr: false), so these read the
// session from the browser. Every admin path starts with /$locale/admin (STRUCTURE.md).

/** Signed-in pages: without a session, go to the login page and come back afterwards. */
export function requireAuth(locale: Locale, returnTo: string): void {
  if (!isSignedIn()) {
    throw redirect({
      to: '/$locale/admin/login',
      params: { locale },
      search: { redirect: returnTo },
    });
  }
}

/** The login page: a signed-in user goes straight to the overview. */
export function requireGuest(locale: Locale): void {
  if (isSignedIn()) {
    throw redirect({ to: '/$locale/admin', params: { locale } });
  }
}

/** A page that needs a permission: without it, the "no access" page. */
export function requirePermission(locale: Locale, permission: Permission): void {
  if (!hasPermission(permission)) {
    throw redirect({ to: '/$locale/admin/forbidden', params: { locale } });
  }
}

/**
 * Where to go after login: only a path inside this admin, so a crafted ?redirect= link can never send
 * the user to another site or to the public pages.
 */
export function safeReturnPath(locale: Locale, value: unknown): string {
  const home = `/${locale}/admin`;
  if (typeof value !== 'string' || !value.startsWith(`${home}`) || value.startsWith('//')) {
    return home;
  }
  const rest = value.slice(home.length);
  if (rest !== '' && !rest.startsWith('/') && !rest.startsWith('?')) {
    return home;
  }
  return value.includes('/login') ? home : value;
}
