import { createFileRoute } from '@tanstack/react-router';
import { NewsListPage } from '@/features/website/news';
import { newsHead } from '@/features/website/news/news-head';
import { toLocale } from '@/shared/lib/i18n/languages';

export const Route = createFileRoute('/$locale/news/')({
  head: ({ params }) => newsHead(toLocale(params.locale)),
  component: NewsListPage,
});
