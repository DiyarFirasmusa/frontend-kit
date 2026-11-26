import { createFileRoute, notFound } from '@tanstack/react-router';
import { loadAdminI18n } from '@/features/admin/i18n/load-admin-i18n';
import { AdminMessage } from '@/features/admin/layout/admin-message';
import { AdminLoading, AdminRoot } from '@/features/admin/layout/admin-root';
import { startAdminMocks } from '@/features/admin/mocks/start-mocks';
import { isLocale, toLocale } from '@/shared/lib/i18n/languages';

// The admin: /ar/admin and /en/admin. "$locale_" (trailing underscore) keeps the language in the URL but
// does not nest the admin inside the public site's layout ($locale.tsx with the site header and footer).
// It renders in the browser only (ssr: false): nothing here is indexed or needs server HTML, and the
// session lives in the browser. The server still sends noindex for it (src/start.ts, __root.tsx).
export const Route = createFileRoute('/$locale_/admin')({
  ssr: false,
  beforeLoad: async ({ params, context }) => {
    if (!isLocale(params.locale)) {
      throw notFound();
    }
    if (context.i18n.language !== params.locale) {
      await context.i18n.changeLanguage(params.locale);
    }
    await Promise.all([loadAdminI18n(context.i18n), startAdminMocks()]);
  },
  pendingComponent: AdminLoading,
  component: AdminLayoutRoute,
  notFoundComponent: () => <AdminMessage kind="notFound" />,
});

function AdminLayoutRoute() {
  const { locale } = Route.useParams();
  return <AdminRoot locale={toLocale(locale)} />;
}
