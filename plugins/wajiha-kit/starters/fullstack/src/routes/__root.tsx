import cairoArabicFont from '@fontsource-variable/cairo/files/cairo-arabic-wght-normal.woff2?url';
import cairoLatinFont from '@fontsource-variable/cairo/files/cairo-latin-wght-normal.woff2?url';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from '@tanstack/react-router';
import { useEffect, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SITE } from '@/config/site.config';
import { getFixedT } from '@/features/site/i18n/resources';
import type { RouterContext } from '@/router';
import { isAdminPath } from '@/shared/lib/admin-path';
import { directionOf, localeFromPath, toLocale } from '@/shared/lib/i18n/languages';
import { THEME_INIT_SCRIPT } from '@/shared/store/theme-store';
import appCss from '@/style/styles.css?url';

export const Route = createRootRouteWithContext<RouterContext>()({
  head: ({ matches }) => {
    const last = matches.at(-1);
    const pathname = last?.pathname ?? '/';
    const locale = toLocale(localeFromPath(pathname));
    // The admin renders in the browser only, so its robots meta and first title come from here, in the
    // server HTML. The server also sends X-Robots-Tag for it (src/start.ts).
    const admin = isAdminPath(pathname);
    // An unmatched URL under /ar or /en is marked _notFound on the layout match, a missing article has status notFound.
    const missing = matches.some(
      (match) => match.status === 'notFound' || match._notFound === true,
    );
    const failed = missing || matches.some((match) => match.status === 'error');
    const t = getFixedT(locale);
    const failedTitle = missing ? t('error.notFoundTitle') : t('error.errorTitle');
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: SITE.themeColor },
        // Real pages set their own title and robots through seo(); a failed page is never indexed.
        ...(failed
          ? [{ title: failedTitle }, { name: 'robots', content: 'noindex, nofollow' }]
          : admin
            ? [{ title: t('common.adminTitle') }, { name: 'robots', content: 'noindex, nofollow' }]
            : []),
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'manifest', href: '/site.webmanifest' },
        // Arabic pages paint Arabic letters plus Latin digits and punctuation: fetch both font files early,
        // so the text does not shift when they arrive.
        ...(locale === 'ar'
          ? [cairoArabicFont, cairoLatinFont].map((href) => ({
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              href,
              crossOrigin: 'anonymous' as const,
            }))
          : []),
      ],
      scripts: [{ children: THEME_INIT_SCRIPT }],
    };
  },
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { i18n } = useRouter().options.context;
  const locale = toLocale(i18n.language);
  return (
    // data-theme is set by the inline script before first paint, so React must not complain about it.
    <html lang={locale} dir={directionOf(locale)} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { i18n } = Route.useRouteContext();
  // Marks the page as interactive. The e2e tests wait for it before they click, so a click never lands on
  // server HTML that React has not taken over yet.
  useEffect(() => {
    document.documentElement.dataset['hydrated'] = 'true';
  }, []);
  return (
    <I18nextProvider i18n={i18n}>
      <Outlet />
    </I18nextProvider>
  );
}
