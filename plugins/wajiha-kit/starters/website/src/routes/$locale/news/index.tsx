import { createFileRoute } from '@tanstack/react-router';
import { listArticles } from '@/content/articles';
import { NewsListPage } from '@/features/website/news';
import { pageHead } from '@/shared/lib/seo/page-head';

export const Route = createFileRoute('/$locale/news/')({
  loader: async ({ params }) => ({ cards: await listArticles(params.locale) }),
  head: ({ params }) => pageHead(params.locale, '/$locale/news'),
  component: NewsListPage,
});
