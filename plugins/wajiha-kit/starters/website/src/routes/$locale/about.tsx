import { createFileRoute } from '@tanstack/react-router';
import { AboutPage } from '@/features/website/about';
import { aboutHead } from '@/features/website/about/about-head';
import { toLocale } from '@/shared/lib/i18n/languages';

export const Route = createFileRoute('/$locale/about')({
  head: ({ params }) => aboutHead(toLocale(params.locale)),
  component: AboutPage,
});
