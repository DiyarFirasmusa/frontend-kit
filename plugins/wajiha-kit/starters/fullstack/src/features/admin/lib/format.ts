import { LANGUAGES, type Locale } from '@/shared/lib/i18n/languages';

/** Whole numbers with Western digits in both languages (the project's convention). */
export function formatCount(value: number, locale: Locale): string {
  return new Intl.NumberFormat(`${LANGUAGES[locale].hreflang}-u-nu-latn`).format(value);
}

/** A short date with Western digits, for "last updated" cells. */
export function formatShortDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(`${LANGUAGES[locale].hreflang}-u-nu-latn`, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}
