import { createFileRoute } from '@tanstack/react-router';
import { NotFound } from '@/features/fallback/not-found';
import { LocaleLayout } from '@/shared/components/locale-layout';
import { isLocale, type Locale } from '@/shared/lib/i18n/languages';

// The language is the first part of every public URL: /ar/... and /en/... (LOCALES). `params.parse` returns
// false for any other first segment, so the route does not match: the root splat (`$.tsx`) answers a real 404,
// and `params.locale` is a `Locale` in this route and every child, with no casts or fallbacks.
export const Route = createFileRoute('/$locale')({
  params: {
    parse: ({ locale }): { locale: Locale } | false => (isLocale(locale) ? { locale } : false),
    stringify: ({ locale }) => ({ locale }),
  },
  beforeLoad: async ({ params, context }) => {
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
  return <LocaleLayout locale={locale} />;
}
