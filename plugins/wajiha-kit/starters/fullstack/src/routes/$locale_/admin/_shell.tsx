import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/features/admin/guards/route-guards';
import { AdminShell } from '@/features/admin/layout/admin-shell';
import { toLocale } from '@/shared/lib/i18n/languages';

// Pathless layout: every signed-in admin page sits inside the sidebar and top bar, behind the auth guard.
export const Route = createFileRoute('/$locale_/admin/_shell')({
  beforeLoad: ({ params, location }) => {
    requireAuth(toLocale(params.locale), location.href);
  },
  component: ShellRoute,
});

function ShellRoute() {
  const { locale } = Route.useParams();
  return <AdminShell locale={toLocale(locale)} />;
}
