import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/features/website/home';
import { homeHead } from '@/features/website/home/home-head';
import { toLocale } from '@/shared/lib/i18n/languages';

export const Route = createFileRoute('/$locale/')({
  head: ({ params }) => homeHead(toLocale(params.locale)),
  component: HomePage,
});
