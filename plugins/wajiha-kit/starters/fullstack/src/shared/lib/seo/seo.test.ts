import { describe, expect, it } from 'vitest';
import { seo, type HeadParts } from './seo';

const env = { siteUrl: 'https://example.test', allowIndexing: true };

function meta(parts: HeadParts, key: 'name' | 'property', value: string): string | undefined {
  const found = parts.meta.find(
    (entry) => key in entry && (entry as Record<string, string>)[key] === value,
  );
  return found === undefined ? undefined : (found as { content: string }).content;
}

const base = {
  locale: 'en',
  path: '/about',
  title: 'About us',
  description: 'A short description.',
} as const;

describe('seo()', () => {
  it('builds title with the site name, description and canonical', () => {
    const parts = seo(base, env);
    expect(parts.meta[0]).toEqual({ title: 'About us | Example Company' });
    expect(meta(parts, 'name', 'description')).toBe('A short description.');
    expect(parts.links).toContainEqual({ rel: 'canonical', href: 'https://example.test/en/about' });
  });

  it('does not repeat the site name on the home page', () => {
    const parts = seo({ ...base, path: '', title: 'Example Company: consulting' }, env);
    expect(parts.meta[0]).toEqual({ title: 'Example Company: consulting' });
    expect(parts.links).toContainEqual({ rel: 'canonical', href: 'https://example.test/en' });
  });

  it('adds hreflang for both languages and x-default', () => {
    const alternates = seo(base, env).links.filter((link) => link.rel === 'alternate');
    expect(alternates.map((link) => link.hrefLang)).toEqual(['ar-IQ', 'en', 'x-default']);
  });

  it('sets the Open Graph locale per language and lists the other one as an alternate', () => {
    const arabic = seo({ ...base, locale: 'ar' }, env);
    expect(meta(arabic, 'property', 'og:locale')).toBe('ar_IQ');
    expect(meta(arabic, 'property', 'og:locale:alternate')).toBe('en_US');
    expect(meta(seo(base, env), 'property', 'og:locale')).toBe('en_US');
  });

  it('uses an absolute share image with its size, and the big card', () => {
    const parts = seo(base, env);
    expect(meta(parts, 'property', 'og:image')).toBe('https://example.test/og-default.png');
    expect(meta(parts, 'property', 'og:image:width')).toBe('1200');
    expect(meta(parts, 'property', 'og:image:height')).toBe('630');
    expect(meta(parts, 'name', 'twitter:card')).toBe('summary_large_image');
  });

  it('is indexable on a production site', () => {
    expect(meta(seo(base, env), 'name', 'robots')).toContain('index, follow');
  });

  it('is noindex everywhere when the site is not allowed to be indexed (staging)', () => {
    const staging = seo(base, { ...env, allowIndexing: false });
    expect(meta(staging, 'name', 'robots')).toBe('noindex, nofollow');
  });

  it('noindex pages get no canonical, no alternates and no JSON-LD', () => {
    const parts = seo({ ...base, noindex: true, jsonLd: [{ '@type': 'Thing' }] }, env);
    expect(meta(parts, 'name', 'robots')).toBe('noindex, nofollow');
    expect(parts.links).toEqual([]);
    expect(parts.scripts).toEqual([]);
  });

  it('emits one JSON-LD script per entry', () => {
    const parts = seo({ ...base, jsonLd: [{ '@type': 'A' }, { '@type': 'B' }] }, env);
    expect(parts.scripts).toHaveLength(2);
    expect(parts.scripts[0]?.type).toBe('application/ld+json');
  });

  it('marks articles with their published time', () => {
    const parts = seo({ ...base, type: 'article', publishedTime: '2026-01-02' }, env);
    expect(meta(parts, 'property', 'og:type')).toBe('article');
    expect(meta(parts, 'property', 'article:published_time')).toBe('2026-01-02');
  });
});
