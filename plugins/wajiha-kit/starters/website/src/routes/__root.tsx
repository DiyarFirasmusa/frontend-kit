import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from '@tanstack/react-router';
import { useEffect, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import type { RouterContext } from '@/router';
import { ThemeColorMeta } from '@/shared/components/theme-color-meta';
import { getFixedT } from '@/shared/lib/i18n/create-i18n';
import { DEFAULT_LOCALE, directionOf, localeFromPath, toLocale } from '@/shared/lib/i18n/languages';
import { failedMeta, failureOf } from '@/shared/lib/seo/failed-page';
import { PRELOAD_FONTS } from '@/shared/style/fonts';
import { THEME_INIT_SCRIPT } from '@/shared/utils/theme';
import appCss from '@/shared/style/styles.css?url';

export const Route = createRootRouteWithContext<RouterContext>()({
  head: ({ matches }) => {
    const last = matches.at(-1);
    const locale = localeFromPath(last?.pathname ?? '/') ?? DEFAULT_LOCALE;
    const t = getFixedT(locale);
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        // theme-color is not here: head() keeps one meta per name (see ThemeColorMeta).
        // Real pages set their own title and robots through seo(); a failed page (404, error) is never indexed.
        ...failedMeta(failureOf(matches), (key) => t(key)),
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'manifest', href: '/site.webmanifest' },
        // The language's own font files, fetched early so the text does not shift when they arrive.
        ...PRELOAD_FONTS[locale].map((href) => ({
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href,
          crossOrigin: 'anonymous' as const,
        })),
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
        <ThemeColorMeta />
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
