import { redirect } from '@tanstack/react-router';
import { otherLocale, type Locale } from '@/shared/lib/i18n/languages';
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

const PARSE_BASE = 'http://admin.invalid';

/**
 * Where to go after login: only a path inside this admin, so a crafted ?redirect= link can never send
 * the user to another site or to the public pages. The value is parsed first, so dot-segments
 * (/en/admin/../x, /en/admin/%2e%2e/x) are resolved before the check, and the login page is never a
 * destination (it would bounce straight back).
 */
export function safeReturnPath(locale: Locale, value: unknown): string {
  const home = `/${locale}/admin`;
  if (typeof value !== 'string' || !value.startsWith('/') || value.includes('\\')) {
    return home;
  }
  let url: URL;
  try {
    // The language switcher keeps ?redirect= as it was: a path written for the other language is moved
    // into this one, so switching language on the login page does not lose the page the user wanted.
    const other = `/${otherLocale(locale)}/admin`;
    const path = value.startsWith(other) ? `${home}${value.slice(other.length)}` : value;
    url = new URL(path, PARSE_BASE);
  } catch {
    return home;
  }
  const { pathname } = url;
  const inside = pathname === home || pathname.startsWith(`${home}/`);
  if (url.origin !== PARSE_BASE || !inside || pathname === `${home}/login`) {
    return home;
  }
  return `${pathname}${url.search}${url.hash}`;
}
