import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@/features/site/contact';
import { contactHead } from '@/features/site/contact/contact-head';
import { toLocale } from '@/shared/lib/i18n/languages';

export const Route = createFileRoute('/$locale/contact')({
  head: ({ params }) => contactHead(toLocale(params.locale)),
  component: ContactPage,
});
