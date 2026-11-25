import { createFileRoute } from '@tanstack/react-router';
import LoginContainer from '@/features/auth/login';
import { requireGuest } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_auth/login/')({
  beforeLoad: () => {
    requireGuest();
  },
  loader: () => loadFeatureLocale('auth/login'),
  component: LoginContainer,
});
