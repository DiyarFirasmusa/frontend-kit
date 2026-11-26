import { describe, expect, it } from 'vitest';
import { ARTICLES, findArticle, sortedArticles } from './articles';

describe('articles', () => {
  it('slugs are unique English kebab-case', () => {
    const slugs = ARTICLES.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('every article is complete in both languages', () => {
    for (const article of ARTICLES) {
      expect(article.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(article.readMinutes).toBeGreaterThan(0);
      for (const locale of ['ar', 'en'] as const) {
        const text = article.text[locale];
        expect(text.title.trim()).not.toBe('');
        expect(text.summary.trim()).not.toBe('');
        expect(text.coverAlt.trim()).not.toBe('');
        expect(text.body.length).toBeGreaterThan(0);
      }
    }
  });

  it('findArticle returns undefined for an unknown slug', () => {
    expect(findArticle('nope')).toBeUndefined();
    expect(findArticle(ARTICLES[0]?.slug ?? '')).toBeDefined();
  });

  it('sortedArticles is newest first and does not reorder the source list', () => {
    const before = ARTICLES.map((article) => article.slug);
    const dates = sortedArticles().map((article) => article.date);
    expect(dates).toEqual(dates.toSorted().toReversed());
    expect(ARTICLES.map((article) => article.slug)).toEqual(before);
  });
});
