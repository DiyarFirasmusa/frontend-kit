import { describe, expect, it } from 'vitest';
import { SITE as SITE_CONFIG } from '@/config/site.config';
import {
  articleJsonLd,
  breadcrumbJsonLd,
  organizationJsonLd,
  serializeJsonLd,
  websiteJsonLd,
} from './jsonld';

const SITE = 'https://example.test';
const BACKSLASH = String.fromCharCode(92);

describe('serializeJsonLd', () => {
  it('escapes "<" so a value can never close the script tag', () => {
    const output = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(output).not.toContain('<');
    expect(output).toContain(`${BACKSLASH}u003c`);
  });

  it('escapes the JS line and paragraph separators', () => {
    const output = serializeJsonLd({
      text: `a${String.fromCharCode(0x2028)}b${String.fromCharCode(0x2029)}c`,
    });
    expect(output).not.toContain(String.fromCharCode(0x2028));
    expect(output).not.toContain(String.fromCharCode(0x2029));
  });

  it('round-trips through JSON.parse', () => {
    const data = { a: '</b>', n: 1 };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});

describe('builders', () => {
  it('organization and website use the page language and the language root URL', () => {
    expect(organizationJsonLd(SITE, 'en')).toMatchObject({
      '@type': 'Organization',
      name: 'Example Company',
      url: 'https://example.test/en',
    });
    expect(websiteJsonLd(SITE, 'ar')).toMatchObject({
      '@type': 'WebSite',
      inLanguage: 'ar',
      url: 'https://example.test/ar',
    });
  });

  it('breadcrumbs are numbered from 1 with absolute URLs', () => {
    const list = breadcrumbJsonLd(SITE, 'en', [
      { name: 'Home', path: '' },
      { name: 'News', path: '/news' },
    ]);
    expect(list['@type']).toBe('BreadcrumbList');
    expect(list['itemListElement']).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.test/en' },
      { '@type': 'ListItem', position: 2, name: 'News', item: 'https://example.test/en/news' },
    ]);
  });

  it('article has the required properties', () => {
    const article = articleJsonLd(SITE, 'en', {
      headline: 'Title',
      description: 'Summary',
      path: '/news/title',
      datePublished: '2026-01-01',
      image: '/images/a.png',
    });
    expect(article).toMatchObject({
      '@type': 'Article',
      headline: 'Title',
      datePublished: '2026-01-01',
      image: 'https://example.test/images/a.png',
      mainEntityOfPage: 'https://example.test/en/news/title',
    });
  });

  it('never puts an SVG cover in Article.image: Google rejects it, so the share image is used', () => {
    const input = { headline: 'T', description: 'S', path: '/news/t', datePublished: '2026-01-01' };
    for (const cover of ['/images/a.svg', '/images/A.SVG', '/images/a']) {
      const { image } = articleJsonLd(SITE, 'en', { ...input, image: cover }) as { image: string };
      expect(image, cover).toBe(`${SITE}${SITE_CONFIG.ogImage.path}`);
    }
    for (const cover of ['/images/a.jpg', '/images/a.JPEG', '/images/a.webp']) {
      const { image } = articleJsonLd(SITE, 'en', { ...input, image: cover }) as { image: string };
      expect(image, cover).toBe(`${SITE}${cover}`);
    }
  });
});
