import { LANGUAGES, type Locale } from '@/shared/lib/i18n/languages';

// Explicit locale tag (LANGUAGES[locale].dateTag) and time zone: the server and the browser must print the
// same text, whatever the machine's own settings are.

/** '2026-09-14' to '14 سبتمبر 2026' / '14 September 2026'. */
export function formatDate(locale: Locale, isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat(LANGUAGES[locale].dateTag, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
