import { createFileRoute, notFound } from '@tanstack/react-router';
import { NotFound } from '@/components/common/not-found';
import { LocaleLayout } from '@/features/site/layout/locale-layout';
import { isLocale } from '@/shared/lib/i18n/languages';

// The language is the first part of every public URL: /ar/... and /en/... Anything else is a 404.
export const Route = createFileRoute('/$locale')({
  beforeLoad: async ({ params, context }) => {
    if (!isLocale(params.locale)) {
      throw notFound();
    }
    // The router's i18n instance is per request. Switching language is a navigation to the other prefix.
    if (context.i18n.language !== params.locale) {
      await context.i18n.changeLanguage(params.locale);
    }
  },
  component: LocaleRoute,
  notFoundComponent: NotFound,
});

function LocaleRoute() {
  const { locale } = Route.useParams();
  return <LocaleLayout locale={isLocale(locale) ? locale : 'ar'} />;
}
