import type { Locale } from '@/shared/lib/i18n/languages';

/** The words of one article in one language, without the body. */
export type ArticleTexts = {
  title: string;
  summary: string;
  coverAlt: string;
};

/** What lists, cards, the head and the sitemap need. A new language in LOCALES fails the typecheck here. */
export type ArticleMeta = {
  /** English kebab-case, lowercase ASCII, the same in both languages, stable once published (see content.md). */
  slug: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  readMinutes: number;
  cover: string;
  text: Record<Locale, ArticleTexts>;
};

/** Paragraphs of one article, per language. One file per article in bodies/, loaded on demand. */
export type ArticleBodies = Record<Locale, string[]>;

/** What an article card shows, in one language. Plain values, so the card needs no content types. */
export type ArticleCardData = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  cover: string;
  coverAlt: string;
};

/** One article in one language, ready for the page. This is what the route loader returns. */
export type Article = ArticleCardData & {
  readMinutes: number;
  /** Paragraphs, in order. */
  body: string[];
};

/** A page's address and last change, for the sitemap. */
export type ArticleEntry = { slug: string; date: string };
