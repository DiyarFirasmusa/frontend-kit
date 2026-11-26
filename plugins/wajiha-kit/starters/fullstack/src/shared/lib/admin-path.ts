// Where the admin lives: /ar/admin and /en/admin (the language stays the first part of every URL).
// The server (robots header), the root head (robots meta) and the admin itself read it from here.
import type { Locale } from './i18n/languages.ts';

export const ADMIN_SEGMENT = 'admin';

/**
 * True for /ar/admin, /en/admin and anything below them, and also for /fr/admin: a wrong language in front
 * of "admin" is still an admin-shaped URL, so it is never indexed (and the route answers it with a 404).
 */
export function isAdminPath(pathname: string): boolean {
  const [, first, second] = pathname.toLowerCase().split('/');
  return first !== undefined && first !== '' && second === ADMIN_SEGMENT;
}

/** The admin's home in one language: /ar/admin. */
export function adminHome(locale: Locale): string {
  return `/${locale}/${ADMIN_SEGMENT}`;
}
