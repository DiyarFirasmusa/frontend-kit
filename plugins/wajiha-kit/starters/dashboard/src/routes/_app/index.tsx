import { createFileRoute } from '@tanstack/react-router';
import HomeContainer from '@/features/dashboard/home';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_app/')({
  loader: () => loadFeatureLocale('dashboard/home'),
  component: HomeContainer,
});
