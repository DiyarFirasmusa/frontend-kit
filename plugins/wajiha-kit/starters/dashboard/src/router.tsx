import type { QueryClient } from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { queryClient } from '@/lib/query-client';
import { routeTree } from './routeTree.gen';

/** What every route's `beforeLoad` and `loader` receive as `context`. */
export interface RouterContext {
  queryClient: QueryClient;
}

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    // The query cache decides freshness; the router never caches loader data.
    defaultPreloadStaleTime: 0,
  });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
