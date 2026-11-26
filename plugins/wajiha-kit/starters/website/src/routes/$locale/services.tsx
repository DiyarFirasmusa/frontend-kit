import { createFileRoute } from '@tanstack/react-router';
import { ServicesPage } from '@/features/website/services';
import { pageHead } from '@/shared/lib/seo/page-head';

export const Route = createFileRoute('/$locale/services')({
  head: ({ params }) => pageHead(params.locale, '/$locale/services'),
  component: ServicesPage,
});
