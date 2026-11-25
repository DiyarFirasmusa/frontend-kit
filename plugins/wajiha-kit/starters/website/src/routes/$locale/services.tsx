import { createFileRoute } from '@tanstack/react-router';
import { ServicesPage } from '@/features/website/services';
import { servicesHead } from '@/features/website/services/services-head';
import { toLocale } from '@/shared/lib/i18n/languages';

export const Route = createFileRoute('/$locale/services')({
  head: ({ params }) => servicesHead(toLocale(params.locale)),
  component: ServicesPage,
});
