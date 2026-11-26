import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/shared/lib/i18n/languages';
import { getArticle, listArticleEntries, listArticles } from './articles';
import { ARTICLE_META } from './articles.data';

describe('article data', () => {
  it('slugs are unique lowercase ASCII kebab-case (the slug policy in .claude/rules/content.md)', () => {
    const slugs = ARTICLE_META.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('every article is complete in every language', () => {
    for (const article of ARTICLE_META) {
      expect(article.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(article.readMinutes).toBeGreaterThan(0);
      for (const locale of LOCALES) {
        const text = article.text[locale];
        expect(text.title.trim()).not.toBe('');
        expect(text.summary.trim()).not.toBe('');
        expect(text.coverAlt.trim()).not.toBe('');
      }
    }
  });

  it('every article has a body file with paragraphs in every language, and no body file is orphaned', async () => {
    const files = readdirSync(join(process.cwd(), 'src', 'content', 'bodies')).map((name) =>
      name.replace(/\.ts$/, ''),
    );
    expect(files.toSorted()).toEqual(ARTICLE_META.map((article) => article.slug).toSorted());
    for (const { slug } of ARTICLE_META) {
      for (const locale of LOCALES) {
        const article = await getArticle(slug, locale);
        expect(article?.body.length ?? 0, `${slug} ${locale}`).toBeGreaterThan(0);
        for (const paragraph of article?.body ?? []) {
          expect(paragraph.trim()).not.toBe('');
        }
      }
    }
  });

  it('paragraphs of one article are unique (they are used as React keys)', async () => {
    for (const { slug } of ARTICLE_META) {
      for (const locale of LOCALES) {
        const body = (await getArticle(slug, locale))?.body ?? [];
        expect(new Set(body).size, `${slug} ${locale}`).toBe(body.length);
      }
    }
  });
});

describe('getArticle', () => {
  it('returns the article in the asked language, with the language-free fields', async () => {
    const meta = ARTICLE_META[0];
    expect(meta).toBeDefined();
    if (meta === undefined) {
      return;
    }
    const article = await getArticle(meta.slug, 'en');
    expect(article).toMatchObject({
      slug: meta.slug,
      title: meta.text.en.title,
      summary: meta.text.en.summary,
      date: meta.date,
      cover: meta.cover,
      coverAlt: meta.text.en.coverAlt,
      readMinutes: meta.readMinutes,
    });
    expect((await getArticle(meta.slug, 'ar'))?.title).toBe(meta.text.ar.title);
  });

  it('returns undefined for an unknown slug, a different case, or anything path-like', async () => {
    const meta = ARTICLE_META[0];
    for (const slug of [
      'nope',
      '',
      '__proto__',
      '../articles',
      meta?.slug.toUpperCase() ?? 'X',
      `${meta?.slug ?? ''}/`,
    ]) {
      expect(await getArticle(slug, 'en'), slug).toBeUndefined();
    }
  });
});

describe('listArticles and listArticleEntries', () => {
  it('lists cards newest first and does not reorder the source list', async () => {
    const before = ARTICLE_META.map((article) => article.slug);
    const cards = await listArticles('en');
    const dates = cards.map((card) => card.date);
    expect(dates).toEqual(dates.toSorted().toReversed());
    expect(cards).toHaveLength(ARTICLE_META.length);
    expect(ARTICLE_META.map((article) => article.slug)).toEqual(before);
    expect(cards[0]).not.toHaveProperty('body');
  });

  it('gives the text of the asked language', async () => {
    const [arabic, english] = await Promise.all([listArticles('ar'), listArticles('en')]);
    expect(arabic[0]?.title).not.toBe(english[0]?.title);
  });

  it('lists slug and date of every article for the sitemap', async () => {
    expect(await listArticleEntries()).toEqual(
      ARTICLE_META.map(({ slug, date }) => ({ slug, date })),
    );
  });
});
