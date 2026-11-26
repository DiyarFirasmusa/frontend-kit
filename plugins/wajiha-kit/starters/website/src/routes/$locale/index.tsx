import { createFileRoute } from '@tanstack/react-router';
import { listArticles } from '@/content/articles';
import { HomePage } from '@/features/website/home';
import { homeHead } from '@/features/website/home/home-head';

export const Route = createFileRoute('/$locale/')({
  loader: async ({ params }) => ({ latest: (await listArticles(params.locale)).slice(0, 2) }),
  head: ({ params }) => homeHead(params.locale),
  component: HomePage,
});
