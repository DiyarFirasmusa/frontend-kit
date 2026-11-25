import { LOCALES } from '@/shared/lib/i18n/languages';
import { alternateLinks, canonicalUrl } from './site';

export type SitemapEntry = {
  /** Language-free path: '' (home), '/about', '/news/some-slug'. */
  path: string;
  /** ISO date (YYYY-MM-DD) of the last real content change. Omit when unknown: a wrong date is worse than none. */
  lastmod?: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
};

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** One <url> per page per language; each lists every language version, itself included. */
export function buildSitemapXml(entries: readonly SitemapEntry[], siteUrl: string): string {
  const urls = entries.flatMap((entry) =>
    LOCALES.map((locale) => {
      const alternates = alternateLinks(siteUrl, entry.path)
        .map(
          (alt) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hrefLang)}" href="${escapeXml(alt.href)}"/>`,
        )
        .join('\n');
      return [
        '  <url>',
        `    <loc>${escapeXml(canonicalUrl(siteUrl, locale, entry.path))}</loc>`,
        alternates,
        ...(entry.lastmod === undefined
          ? []
          : [`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`]),
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority.toFixed(1)}</priority>`,
        '  </url>',
      ].join('\n');
    }),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

export function buildRobotsTxt(input: { siteUrl: string; allowIndexing: boolean }): string {
  if (!input.allowIndexing) {
    // Staging and preview copies must never be indexed.
    return ['User-agent: *', 'Disallow: /', ''].join('\n');
  }
  // Private paths are kept out with noindex (page tag and X-Robots-Tag), never with Disallow:
  // a crawler that is blocked here never reads the noindex.
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${input.siteUrl}/sitemap.xml`, ''].join('\n');
}
