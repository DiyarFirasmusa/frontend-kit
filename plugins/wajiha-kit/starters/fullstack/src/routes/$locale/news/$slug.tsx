import { createFileRoute } from '@tanstack/react-router';
import { NotFound } from '@/components/common/not-found';
import { ArticlePage } from '@/features/site/news/pages/article';
import { articleHead } from '@/features/site/news/pages/article/article-head';
import { loadArticle } from '@/features/site/news/pages/article/load-article';
import { toLocale } from '@/shared/lib/i18n/languages';

export const Route = createFileRoute('/$locale/news/$slug')({
  loader: ({ params }) => loadArticle(params.slug),
  head: ({ params, loaderData }) => articleHead(toLocale(params.locale), loaderData?.slug),
  component: ArticlePage,
  // A missing article is shown inside the page layout (header and footer stay).
  notFoundComponent: NotFound,
});
