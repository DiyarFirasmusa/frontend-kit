import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@/features/website/contact';
import { pageHead } from '@/shared/lib/seo/page-head';

export const Route = createFileRoute('/$locale/contact')({
  head: ({ params }) => pageHead(params.locale, '/$locale/contact'),
  component: ContactPage,
});
