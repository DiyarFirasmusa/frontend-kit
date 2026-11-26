// The single source of truth for languages. Nothing else hardcodes 'ar', 'en', 'rtl' or a locale code.
export const LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export type Direction = 'rtl' | 'ltr';

export const DEFAULT_LOCALE: Locale = 'ar';

export const LANGUAGES: Record<
  Locale,
  { label: string; dir: Direction; hreflang: string; ogLocale: string }
> = {
  ar: { label: 'العربية', dir: 'rtl', hreflang: 'ar-IQ', ogLocale: 'ar_IQ' },
  en: { label: 'English', dir: 'ltr', hreflang: 'en', ogLocale: 'en_US' },
};

export const LOCALE_COOKIE = 'lang';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** A locale from untrusted input, or the default. Never throws. */
export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function directionOf(locale: Locale): Direction {
  return LANGUAGES[locale].dir;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'ar' ? 'en' : 'ar';
}

/** The locale named by the first path segment (/ar/about gives "ar"), or undefined. */
export function localeFromPath(pathname: string): Locale | undefined {
  const first = pathname.split('/')[1];
  return isLocale(first) ? first : undefined;
}

/** The same page in another language: /ar/about to /en/about. Unknown paths go to the language root. */
export function swapLocaleInPath(pathname: string, target: Locale): string {
  const segments = pathname.split('/');
  if (isLocale(segments[1])) {
    segments[1] = target;
    return segments.join('/');
  }
  return `/${target}`;
}

/**
 * Picks a locale from an Accept-Language header (q values respected), or undefined.
 * Used only to choose where "/" redirects; pages themselves never depend on the header.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale | undefined {
  if (!acceptLanguage) {
    return undefined;
  }
  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const quality = q === undefined ? 1 : Number(q.slice(2));
      return { tag: tag.trim().toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality };
    })
    .filter((entry) => entry.tag !== '' && entry.quality > 0)
    .toSorted((a, b) => b.quality - a.quality);
  for (const { tag } of ranked) {
    const base = tag.split('-')[0];
    if (isLocale(base)) {
      return base;
    }
  }
  return undefined;
}
