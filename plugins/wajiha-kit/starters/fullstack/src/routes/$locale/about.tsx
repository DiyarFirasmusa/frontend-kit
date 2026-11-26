import { createFileRoute } from '@tanstack/react-router';
import { AboutPage } from '@/features/site/about';
import { aboutHead } from '@/features/site/about/about-head';
import { toLocale } from '@/shared/lib/i18n/languages';

export const Route = createFileRoute('/$locale/about')({
  head: ({ params }) => aboutHead(toLocale(params.locale)),
  component: AboutPage,
});
