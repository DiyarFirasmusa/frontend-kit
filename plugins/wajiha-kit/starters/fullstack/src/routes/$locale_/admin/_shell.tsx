import { createFileRoute } from '@tanstack/react-router';
import { AdminShell } from '@/features/admin/layout/admin-shell';
import { toLocale } from '@/shared/lib/i18n/languages';

// Pathless layout: every signed-in admin page sits inside the sidebar and top bar, behind the auth guard.
// The guard is imported when it runs, so the session stores stay out of the public entry chunk.
export const Route = createFileRoute('/$locale_/admin/_shell')({
  beforeLoad: async ({ params, location }) => {
    const { requireAuth } = await import('@/features/admin/guards/route-guards');
    requireAuth(toLocale(params.locale), location.href);
  },
  component: ShellRoute,
});

function ShellRoute() {
  const { locale } = Route.useParams();
  return <AdminShell locale={toLocale(locale)} />;
}
