import type { Locale } from '@/shared/lib/i18n/languages';

// Explicit locale and time zone: the server and the browser must print the same text, whatever the
// machine's own settings are. Latin digits in both languages so numbers match the rest of the page.
const TAGS: Record<Locale, string> = { ar: 'ar-IQ-u-nu-latn', en: 'en-GB' };

/** '2026-09-14' to '14 سبتمبر 2026' / '14 September 2026'. */
export function formatDate(locale: Locale, isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat(TAGS[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
