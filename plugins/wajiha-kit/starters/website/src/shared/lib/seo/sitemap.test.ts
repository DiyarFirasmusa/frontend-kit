import { describe, expect, it } from 'vitest';
import { LANGUAGES, LOCALES } from '@/shared/lib/i18n/languages';
import { buildRobotsTxt, buildSitemapXml, escapeXml } from './sitemap';

const SITE = 'https://example.test';

describe('buildSitemapXml', () => {
  const xml = buildSitemapXml(
    [{ path: '/about', changefreq: 'monthly', priority: 0.7, lastmod: '2026-01-02' }],
    SITE,
  );

  it('lists one URL per language', () => {
    for (const locale of LOCALES) {
      expect(xml).toContain(`<loc>https://example.test/${locale}/about</loc>`);
    }
  });

  it('gives every URL an alternate for every language, and x-default', () => {
    // One <url> per language, each carrying the whole set of alternates.
    for (const hreflang of [...LOCALES.map((locale) => LANGUAGES[locale].hreflang), 'x-default']) {
      expect(xml.match(new RegExp(`hreflang="${hreflang}"`, 'g')), hreflang).toHaveLength(
        LOCALES.length,
      );
    }
  });

  it('includes lastmod only when given', () => {
    expect(xml).toContain('<lastmod>2026-01-02</lastmod>');
    const without = buildSitemapXml([{ path: '', changefreq: 'weekly', priority: 1 }], SITE);
    expect(without).not.toContain('<lastmod>');
    expect(without).toContain('<priority>1.0</priority>');
  });

  it('is a well-formed urlset', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml.trim().endsWith('</urlset>')).toBe(true);
  });

  it('escapes XML special characters', () => {
    expect(escapeXml(`a&b<c>"d"'e'`)).toBe('a&amp;b&lt;c&gt;&quot;d&quot;&apos;e&apos;');
  });
});

describe('buildRobotsTxt', () => {
  it('allows crawling and names the sitemap on production', () => {
    const text = buildRobotsTxt({ siteUrl: SITE, allowIndexing: true });
    expect(text).toContain('Allow: /');
    expect(text).toContain('Sitemap: https://example.test/sitemap.xml');
    expect(text).not.toContain('Disallow');
  });

  it('blocks everything on a non-production site', () => {
    const text = buildRobotsTxt({ siteUrl: SITE, allowIndexing: false });
    expect(text).toContain('Disallow: /');
    expect(text).not.toContain('Sitemap:');
  });
});
