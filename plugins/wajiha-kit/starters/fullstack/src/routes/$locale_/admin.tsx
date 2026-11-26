import { createFileRoute, notFound } from '@tanstack/react-router';
import { AdminLoading } from '@/features/admin/layout/admin-loading';
import { AdminMessage } from '@/features/admin/layout/admin-message';
import { AdminRoot } from '@/features/admin/layout/admin-root';
import { getAdminQueryClient } from '@/features/admin/lib/query-client';
import { isLocale, toLocale } from '@/shared/lib/i18n/languages';

// The admin: /ar/admin and /en/admin. "$locale_" (trailing underscore) keeps the language in the URL but
// does not nest the admin inside the public site's layout ($locale.tsx with the site header and footer).
// It renders in the browser only (ssr: false): nothing here is indexed or needs server HTML, and the
// session lives in the browser. The server still sends noindex for it (src/start.ts, __root.tsx).
//
// Public-entry rule: this file is part of the entry chunk every public page downloads. Import admin code
// here only through import() or through the route's split properties (component, notFoundComponent);
// AdminLoading has no imports for that reason. "npm run check:bundle" fails when admin code leaks.
export const Route = createFileRoute('/$locale_/admin')({
  // An unknown language (/fr/admin) is rendered on the server so it answers a real 404 (with noindex),
  // like the public pages do. A valid one is client-only.
  ssr: ({ params }) => !(params.status === 'success' && isLocale(params.value.locale)),
  beforeLoad: async ({ params, context }) => {
    if (!isLocale(params.locale)) {
      throw notFound();
    }
    if (context.i18n.language !== params.locale) {
      await context.i18n.changeLanguage(params.locale);
    }
    const [{ loadAdminI18n }, { startAdminMocks }] = await Promise.all([
      import('@/features/admin/i18n/load-admin-i18n'),
      import('@/features/admin/mocks/start-mocks'),
    ]);
    await Promise.all([loadAdminI18n(context.i18n), startAdminMocks()]);
  },
  pendingComponent: AdminLoading,
  component: AdminLayoutRoute,
  notFoundComponent: AdminNotFoundRoute,
});

function AdminLayoutRoute() {
  const { locale } = Route.useParams();
  // One client for the whole admin visit: the loaders prefetch into the same one (see lib/query-client.ts).
  return <AdminRoot locale={toLocale(locale)} queryClient={getAdminQueryClient()} />;
}

function AdminNotFoundRoute() {
  return <AdminMessage kind="notFound" />;
}
