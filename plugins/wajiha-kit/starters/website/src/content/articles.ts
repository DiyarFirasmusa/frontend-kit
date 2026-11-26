// The content seam: the only way pages, route loaders and the sitemap read articles. Everything is async and
// takes the language, so the demo data below can be swapped for a CMS or an API without touching a page:
// keep these three signatures and return the same types (src/content/types.ts).
//   - Needs a secret (API token)? Do the fetch inside a createServerFn handler, never in this file's client
//     path. Note that deploy/nginx/site.conf rate-limits /_serverFn/ for the contact form: give a read
//     function its own location or a higher limit before you rely on it for navigation.
//   - Slugs: lowercase ASCII kebab-case (see .claude/rules/content.md). A CMS that allows other spellings must
//     also change canonicalRedirect and normalizePath, which are case-preserving for slugs but never decode them.
// The demo keeps the small part (titles, dates) in articles.data.ts and each body in bodies/<slug>.ts, which
// Vite splits into its own chunk, so article text is never part of the entry script every page loads.
import type { Locale } from '@/shared/lib/i18n/languages';
import { ARTICLE_META } from './articles.data';
import type { Article, ArticleBodies, ArticleCardData, ArticleEntry, ArticleMeta } from './types';

type BodyModule = { default: ArticleBodies };
const BODY_LOADERS = import.meta.glob<BodyModule>('./bodies/*.ts');

function card(meta: ArticleMeta, locale: Locale): ArticleCardData {
  const text = meta.text[locale];
  return {
    slug: meta.slug,
    title: text.title,
    summary: text.summary,
    date: meta.date,
    cover: meta.cover,
    coverAlt: text.coverAlt,
  };
}

/** Every article as a card in one language, newest first. */
export async function listArticles(locale: Locale): Promise<ArticleCardData[]> {
  return ARTICLE_META.toSorted((a, b) => b.date.localeCompare(a.date)).map((meta) =>
    card(meta, locale),
  );
}

/** The article with this slug in one language, or undefined (the loader turns that into a real 404). */
export async function getArticle(slug: string, locale: Locale): Promise<Article | undefined> {
  const meta = ARTICLE_META.find((candidate) => candidate.slug === slug);
  const load = BODY_LOADERS[`./bodies/${slug}.ts`];
  if (meta === undefined || load === undefined) {
    return undefined;
  }
  const { default: bodies } = await load();
  return { ...card(meta, locale), readMinutes: meta.readMinutes, body: bodies[locale] };
}

/** Slug and date of every article, for the sitemap. */
export async function listArticleEntries(): Promise<ArticleEntry[]> {
  return ARTICLE_META.map(({ slug, date }) => ({ slug, date }));
}
