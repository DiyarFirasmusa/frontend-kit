import { describe, expect, it } from 'vitest';
import { absoluteUrl, alternateLinks, canonicalUrl, localizedPath, normalizePath } from './site';

const SITE = 'https://example.test';

describe('normalizePath', () => {
  it('strips query, hash and trailing slash', () => {
    expect(normalizePath('/about/?utm_source=x#top')).toBe('/about');
    expect(normalizePath('/news/some-slug/')).toBe('/news/some-slug');
  });

  it('keeps the case of a slug: only the language prefix and NAV segments are lowercase by policy', () => {
    expect(normalizePath('/news/Q4-Plan')).toBe('/news/Q4-Plan');
  });

  it('percent-encodes non-ASCII slugs with uppercase hex, the spelling canonicalRedirect accepts', () => {
    expect(normalizePath('/news/مقال')).toBe('/news/%D9%85%D9%82%D8%A7%D9%84');
    expect(normalizePath('/news/%d9%85%d9%82%d8%a7%d9%84')).toBe('/news/%D9%85%D9%82%D8%A7%D9%84');
    expect(normalizePath('/news/a b')).toBe('/news/a%20b');
    expect(normalizePath('/news/50%25-off')).toBe('/news/50%25-off');
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

  it('a canonical URL for an Arabic slug is already in the form the server answers with 200', () => {
    expect(canonicalUrl(SITE, 'ar', '/news/مقال')).toBe(
      'https://example.test/ar/news/%D9%85%D9%82%D8%A7%D9%84',
    );
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
