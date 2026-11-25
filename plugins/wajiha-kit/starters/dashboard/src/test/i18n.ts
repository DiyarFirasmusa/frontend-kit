import i18n, { type SupportedLanguage } from '@/lib/i18n/i18n';

/** Switch the test i18n instance; the setup file restores `en` after each test. */
export async function setTestLanguage(lng: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lng);
}

/** Translate a key the way the app does, for text-based assertions. */
export function tt(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
