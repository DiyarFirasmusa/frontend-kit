import { createRouter } from '@tanstack/react-router';
import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import type { i18n as I18n } from 'i18next';
import { NotFound } from '@/features/fallback/not-found';
import { DefaultCatchBoundary } from '@/features/fallback/route-error';
import { createI18n } from '@/shared/lib/i18n/create-i18n';
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
    context: { i18n: createI18n(initialLocale()) } satisfies RouterContext,
    // The router's own trailing-slash redirect (307) would send an unknown URL to another unknown URL before
    // its 404. The one canonical spelling is enforced earlier, in src/start.ts, and only for pages that exist.
    trailingSlash: 'preserve',
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
