import { LANGUAGES, LOCALES, DEFAULT_LOCALE, type Locale } from '@/shared/lib/i18n/languages';

export type SeoEnv = { siteUrl: string; allowIndexing: boolean };

/**
 * The one spelling of a URL path for canonical, alternate and sitemap URLs: no query, no hash, no trailing
 * slash ("/" stays "/"), and each segment percent-encoded with uppercase hex, the form a browser sends and
 * canonicalRedirectIfExists accepts. A slug keeps the spelling it is given, which must be its stored one (the
 * server redirects any other case to it, see .claude/rules/content.md).
 */
export function normalizePath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0] ?? '';
  const withSlash =
    withoutQuery.startsWith('/') || withoutQuery === '' ? withoutQuery : `/${withoutQuery}`;
  const encoded = withSlash.split('/').map(encodePathSegment).join('/');
  return encoded.length > 1 ? encoded.replace(/\/+$/, '') : encoded;
}

/** Encodes what is not URL-safe (Arabic letters, spaces) and keeps existing %XX escapes, uppercased. */
export function encodePathSegment(segment: string): string {
  return segment
    .split(/(%[0-9a-fA-F]{2})/)
    .map((part, index) => (index % 2 === 1 ? part.toUpperCase() : encodeURI(part)))
    .join('');
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
