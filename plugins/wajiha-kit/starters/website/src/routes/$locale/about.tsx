import { createFileRoute } from '@tanstack/react-router';
import { AboutPage } from '@/features/website/about';
import { pageHead } from '@/shared/lib/seo/page-head';

export const Route = createFileRoute('/$locale/about')({
  head: ({ params }) => pageHead(params.locale, '/$locale/about'),
  component: AboutPage,
});
