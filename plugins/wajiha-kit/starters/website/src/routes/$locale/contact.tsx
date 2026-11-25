import { createFileRoute } from '@tanstack/react-router';
import { ContactPage } from '@/features/website/contact';
import { contactHead } from '@/features/website/contact/contact-head';
import { toLocale } from '@/shared/lib/i18n/languages';

export const Route = createFileRoute('/$locale/contact')({
  head: ({ params }) => contactHead(toLocale(params.locale)),
  component: ContactPage,
});
