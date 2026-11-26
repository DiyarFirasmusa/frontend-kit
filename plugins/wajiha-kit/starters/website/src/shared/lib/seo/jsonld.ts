import { SITE, siteName } from '@/config/site.config';
import type { Locale } from '@/shared/lib/i18n/languages';
import { absoluteUrl, canonicalUrl } from './site';

export type JsonLd = Record<string, unknown>;

// Built from char codes so no invisible character lives in this source file.
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

/**
 * Serializes JSON-LD for an inline <script>. "<" is escaped so a value like "</script>" cannot
 * close the tag early, and U+2028 / U+2029 are escaped because they break old JS parsers.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data)
    .replaceAll('<', '\\u003c')
    .replaceAll(LINE_SEPARATOR, '\\u2028')
    .replaceAll(PARAGRAPH_SEPARATOR, '\\u2029');
}

export function organizationJsonLd(siteUrl: string, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName(locale),
    url: canonicalUrl(siteUrl, locale, ''),
    email: SITE.email,
    logo: absoluteUrl(siteUrl, '/favicon.svg'),
  };
}

export function websiteJsonLd(siteUrl: string, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName(locale),
    url: canonicalUrl(siteUrl, locale, ''),
    inLanguage: locale,
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(
  siteUrl: string,
  locale: Locale,
  crumbs: readonly Crumb[],
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: canonicalUrl(siteUrl, locale, crumb.path),
    })),
  };
}

/** Image types Google accepts for rich results (an SVG is refused, so it never goes into Article.image). */
const RASTER_IMAGE = /.(png|jpe?g|webp|gif|avif)$/i;

export type ArticleInput = {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  /** Path of the article's cover. A cover that is not a raster image (an SVG) is replaced by the share image. */
  image: string;
};

export function articleJsonLd(siteUrl: string, locale: Locale, article: ArticleInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    inLanguage: locale,
    datePublished: article.datePublished,
    image: absoluteUrl(
      siteUrl,
      RASTER_IMAGE.test(article.image) ? article.image : SITE.ogImage.path,
    ),
    mainEntityOfPage: canonicalUrl(siteUrl, locale, article.path),
    author: { '@type': 'Organization', name: siteName(locale) },
    publisher: { '@type': 'Organization', name: siteName(locale) },
  };
}
