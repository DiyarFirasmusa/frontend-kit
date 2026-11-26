import type { i18n as I18n } from 'i18next';
import { LOCALES } from '@/shared/lib/i18n/languages';

/**
 * Adds the admin's text to the page's i18n instance (the one the router holds), once. The site and the
 * admin share that instance and its language, which always comes from the URL (/ar/admin, /en/admin).
 * Existing keys are never overwritten: admin group names are unique (npm run i18n:validate checks it).
 */
export async function loadAdminI18n(i18n: I18n): Promise<void> {
  if (i18n.hasResourceBundle('en', 'translation') && i18n.exists('admin.title')) {
    return;
  }
  const { adminBundles } = await import('./admin-resources');
  for (const locale of LOCALES) {
    i18n.addResourceBundle(locale, 'translation', adminBundles[locale], true, false);
  }
}
