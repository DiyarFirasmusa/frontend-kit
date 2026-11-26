import { adminBundles } from '@/features/admin/i18n/admin-resources';
import { resources } from '@/features/site/i18n/resources';
import { createI18n, mergeBundles } from '@/shared/lib/i18n/create-i18n';
import type { Locale } from '@/shared/lib/i18n/languages';

/**
 * One i18n instance for component tests, with the site's and the admin's text (the app adds the admin's
 * text when the admin loads). Tests run in English; setTestLanguage('ar') checks the Arabic path and the
 * setup file switches back after each test.
 */
export const testI18n = createI18n(
  {
    ar: { translation: mergeBundles(resources.ar.translation, adminBundles.ar) },
    en: { translation: mergeBundles(resources.en.translation, adminBundles.en) },
  },
  'en',
);

export async function setTestLanguage(locale: Locale): Promise<void> {
  await testI18n.changeLanguage(locale);
}

/** Translate a key the way the app does, for text-based assertions. */
export function tt(key: string, options?: Record<string, string | number>): string {
  return String(testI18n.t(key, { ...options }));
}
