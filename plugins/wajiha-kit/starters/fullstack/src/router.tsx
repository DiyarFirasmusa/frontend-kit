import { createRouter } from '@tanstack/react-router';
import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import type { i18n as I18n } from 'i18next';
import { NotFound } from '@/components/common/not-found';
import { DefaultCatchBoundary } from '@/components/common/route-error';
import { createSiteI18n } from '@/features/site/i18n/resources';
import { DEFAULT_LOCALE, localeFromPath, type Locale } from '@/shared/lib/i18n/languages';
import { nonceFor } from '@/shared/server/security-headers';
import { routeTree } from './routeTree.gen';

export type RouterContext = { i18n: I18n };

/** The language of the page being rendered, read from the URL on both sides so they always agree. */
const initialLocale = createIsomorphicFn()
  .server((): Locale => localeFromPath(new URL(getRequest().url).pathname) ?? DEFAULT_LOCALE)
  .client((): Locale => localeFromPath(window.location.pathname) ?? DEFAULT_LOCALE);

/** The CSP nonce of the current server request (undefined in the browser). */
const requestNonce = createIsomorphicFn()
  .server((): string | undefined => nonceFor(getRequest()))
  .client((): string | undefined => undefined);

/** A new router per request: its i18n instance must never be shared between visitors. */
export function getRouter() {
  const nonce = requestNonce();
  return createRouter({
    routeTree,
    context: { i18n: createSiteI18n(initialLocale()) } satisfies RouterContext,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: NotFound,
    ...(nonce === undefined ? {} : { ssr: { nonce } }),
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
