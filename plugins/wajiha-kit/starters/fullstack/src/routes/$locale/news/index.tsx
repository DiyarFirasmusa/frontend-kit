import { createFileRoute } from '@tanstack/react-router';
import { NewsListPage } from '@/features/site/news';
import { newsHead } from '@/features/site/news/news-head';
import { toLocale } from '@/shared/lib/i18n/languages';

export const Route = createFileRoute('/$locale/news/')({
  head: ({ params }) => newsHead(toLocale(params.locale)),
  component: NewsListPage,
});
