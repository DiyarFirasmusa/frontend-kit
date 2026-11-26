import { createFileRoute, notFound } from '@tanstack/react-router';
import { getArticle, listArticles } from '@/content/articles';
import { NotFound } from '@/features/fallback/not-found';
import { ArticlePage } from '@/features/website/news/pages/article';
import { articleHead } from '@/features/website/news/pages/article/article-head';

export const Route = createFileRoute('/$locale/news/$slug')({
  // The loader returns the article in the page language (never just a slug that every consumer looks up
  // again), so head() and the page read the same data. A missing article is a real 404.
  loader: async ({ params }) => {
    const article = await getArticle(params.slug, params.locale);
    if (article === undefined) {
      throw notFound();
    }
    const others = await listArticles(params.locale);
    return { article, related: others.filter((card) => card.slug !== article.slug).slice(0, 2) };
  },
  head: ({ params, loaderData }) => articleHead(params.locale, loaderData?.article),
  component: ArticlePage,
  // A missing article is shown inside the page layout (header and footer stay).
  notFoundComponent: NotFound,
});
