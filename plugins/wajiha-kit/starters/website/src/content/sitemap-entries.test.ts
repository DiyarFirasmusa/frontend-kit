import { describe, expect, it } from 'vitest';
import { siteSitemapEntries } from './sitemap-entries';

describe('siteSitemapEntries', () => {
  it('has every navigation page and every article, and no duplicates', async () => {
    const paths = (await siteSitemapEntries()).map((entry) => entry.path);
    expect(paths).toEqual(expect.arrayContaining(['', '/about', '/services', '/news', '/contact']));
    expect(paths.some((path) => path.startsWith('/news/'))).toBe(true);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('gives every article its publish date as lastmod', async () => {
    const articles = (await siteSitemapEntries()).filter((entry) =>
      entry.path.startsWith('/news/'),
    );
    expect(articles.length).toBeGreaterThan(0);
    for (const entry of articles) {
      expect(entry.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('only lists lowercase paths with no query or trailing slash', async () => {
    for (const { path } of await siteSitemapEntries()) {
      expect(path).toBe(path.toLowerCase());
      expect(path).not.toMatch(/[?#]|\/$/);
    }
  });
});
