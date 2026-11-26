import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/features/admin/auth';
import { requireGuest } from '@/features/admin/guards/route-guards';
import { toLocale } from '@/shared/lib/i18n/languages';

type LoginSearch = { redirect?: string };

export const Route = createFileRoute('/$locale_/admin/login')({
  validateSearch: (raw: Record<string, unknown>): LoginSearch =>
    typeof raw['redirect'] === 'string' ? { redirect: raw['redirect'] } : {},
  beforeLoad: ({ params }) => {
    requireGuest(toLocale(params.locale));
  },
  component: LoginRoute,
});

function LoginRoute() {
  const { locale } = Route.useParams();
  const { redirect } = Route.useSearch();
  return <LoginPage locale={toLocale(locale)} redirect={redirect} />;
}
