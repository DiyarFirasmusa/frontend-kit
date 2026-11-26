import { LANGUAGES, LOCALES, DEFAULT_LOCALE, type Locale } from '@/shared/lib/i18n/languages';

export type SeoEnv = { siteUrl: string; allowIndexing: boolean };

/** Lowercase, no query, no hash, no trailing slash. "/" stays "/". */
export function normalizePath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0] ?? '';
  const lower = withoutQuery.toLowerCase();
  const withSlash = lower.startsWith('/') || lower === '' ? lower : `/${lower}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash;
}

/** The URL path of a page in a language: ('ar', '/about') gives '/ar/about'; ('ar', '') gives '/ar'. */
export function localizedPath(locale: Locale, path: string): string {
  const normalized = normalizePath(path);
  return normalized === '/' || normalized === '' ? `/${locale}` : `/${locale}${normalized}`;
}

export function absoluteUrl(siteUrl: string, path: string): string {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function canonicalUrl(siteUrl: string, locale: Locale, path: string): string {
  return absoluteUrl(siteUrl, localizedPath(locale, path));
}

export type AlternateLink = { hrefLang: string; href: string };

/**
 * Every language version of a page plus x-default (the default language).
 * Each page lists all of them, itself included, so the pairs link back to each other.
 */
export function alternateLinks(siteUrl: string, path: string): AlternateLink[] {
  return [
    ...LOCALES.map((locale) => ({
      hrefLang: LANGUAGES[locale].hreflang,
      href: canonicalUrl(siteUrl, locale, path),
    })),
    { hrefLang: 'x-default', href: canonicalUrl(siteUrl, DEFAULT_LOCALE, path) },
  ];
}
