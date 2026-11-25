import { describe, expect, it } from 'vitest';
import { absoluteUrl, alternateLinks, canonicalUrl, localizedPath, normalizePath } from './site';

const SITE = 'https://example.test';

describe('normalizePath', () => {
  it('lowercases and strips query, hash and trailing slash', () => {
    expect(normalizePath('/About/?utm_source=x#top')).toBe('/about');
    expect(normalizePath('/news/Some-Slug/')).toBe('/news/some-slug');
  });

  it('keeps the root as "/" and adds a missing leading slash', () => {
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('about')).toBe('/about');
  });
});

describe('localizedPath and canonicalUrl', () => {
  it('puts the language first; the home page is the bare language root', () => {
    expect(localizedPath('ar', '/about')).toBe('/ar/about');
    expect(localizedPath('en', '')).toBe('/en');
    expect(localizedPath('en', '/')).toBe('/en');
  });

  it('builds an absolute canonical without a trailing slash', () => {
    expect(canonicalUrl(SITE, 'en', '')).toBe('https://example.test/en');
    expect(canonicalUrl(SITE, 'ar', '/news/x?page=2')).toBe('https://example.test/ar/news/x');
  });

  it('absoluteUrl joins the origin and a path', () => {
    expect(absoluteUrl(SITE, '/og-default.png')).toBe('https://example.test/og-default.png');
    expect(absoluteUrl(SITE, 'og-default.png')).toBe('https://example.test/og-default.png');
  });
});

describe('alternateLinks', () => {
  it('lists both languages and x-default (the default language)', () => {
    expect(alternateLinks(SITE, '/about')).toEqual([
      { hrefLang: 'ar-IQ', href: 'https://example.test/ar/about' },
      { hrefLang: 'en', href: 'https://example.test/en/about' },
      { hrefLang: 'x-default', href: 'https://example.test/ar/about' },
    ]);
  });

  it('is the same list from either language, so the pairs link back to each other', () => {
    expect(alternateLinks(SITE, '/services')).toEqual(alternateLinks(SITE, '/services'));
    const hrefs = alternateLinks(SITE, '').map((link) => link.href);
    expect(hrefs).toContain(canonicalUrl(SITE, 'ar', ''));
    expect(hrefs).toContain(canonicalUrl(SITE, 'en', ''));
  });
});
