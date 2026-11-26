import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/features/admin/auth';
import { adminHead } from '@/features/admin/layout/admin-head';
import { toLocale } from '@/shared/lib/i18n/languages';

/** reason=expired: the session ended while the user was on a page (a 401), the login page says so. */
type LoginSearch = { redirect?: string; reason?: 'expired' };

export const Route = createFileRoute('/$locale_/admin/login')({
  validateSearch: (raw: Record<string, unknown>): LoginSearch => ({
    ...(typeof raw['redirect'] === 'string' ? { redirect: raw['redirect'] } : {}),
    ...(raw['reason'] === 'expired' ? { reason: 'expired' as const } : {}),
  }),
  beforeLoad: async ({ params }) => {
    const { requireGuest } = await import('@/features/admin/guards/route-guards');
    requireGuest(toLocale(params.locale));
  },
  head: adminHead('login.title'),
  component: LoginRoute,
});

function LoginRoute() {
  const { locale } = Route.useParams();
  const { redirect, reason } = Route.useSearch();
  return <LoginPage locale={toLocale(locale)} redirect={redirect} expired={reason === 'expired'} />;
}
