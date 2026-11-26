import { QueryClient } from '@tanstack/react-query';
import { errorStatus } from '../api/errors';

/** Errors are shown by the API layer (toasts) or by the page itself. */
export function createAdminQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Never retry what will fail again: no session, no right, nothing there.
        retry: (count, error) => {
          const status = errorStatus(error);
          return count < 2 && (status === undefined || status >= 500);
        },
      },
      mutations: { retry: false },
    },
  });
}

let shared: QueryClient | undefined;

/**
 * The admin's one QueryClient, made the first time the admin is entered. AdminRoot hands it to the
 * components and the route loaders prefetch into it (<feature>/prefetch.ts), so both use the same cache.
 * It never exists on the server: the admin renders in the browser only (ssr: false), so nothing here is
 * shared between visitors.
 *
 * Why not the router context (a beforeLoad return value, or getRouter())? getRouter() is in the public
 * entry chunk: importing TanStack Query there added 4.6 KB gzip to every public page. A beforeLoad return
 * value is type-checked as serializable by TanStack Start, which a QueryClient is not (TS2322).
 */
export function getAdminQueryClient(): QueryClient {
  shared ??= createAdminQueryClient();
  return shared;
}
