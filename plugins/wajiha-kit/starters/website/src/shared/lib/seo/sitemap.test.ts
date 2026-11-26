import { describe, expect, it } from 'vitest';
import { buildRobotsTxt, buildSitemapXml, escapeXml } from './sitemap';

const SITE = 'https://example.test';

describe('buildSitemapXml', () => {
  const xml = buildSitemapXml(
    [{ path: '/about', changefreq: 'monthly', priority: 0.7, lastmod: '2026-01-02' }],
    SITE,
  );

  it('lists one URL per language', () => {
    expect(xml).toContain('<loc>https://example.test/ar/about</loc>');
    expect(xml).toContain('<loc>https://example.test/en/about</loc>');
  });

  it('gives every URL both alternates and x-default', () => {
    expect(xml.match(/hreflang="ar-IQ"/g)).toHaveLength(2);
    expect(xml.match(/hreflang="en"/g)).toHaveLength(2);
    expect(xml.match(/hreflang="x-default"/g)).toHaveLength(2);
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
