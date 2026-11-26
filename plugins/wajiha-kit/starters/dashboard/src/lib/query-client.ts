import { QueryClient } from '@tanstack/react-query';
import { getErrorStatus } from '@/api/error/api-error';

function retryOnceUnlessClientError(
  failureCount: number,
  error: unknown,
): boolean {
  const status = getErrorStatus(error) ?? 0;
  if (status >= 400 && status < 500) {
    return false;
  }
  return failureCount < 1;
}

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Above 0 so a hover preload or a remount is not a second request.
        staleTime: 5_000,
        // One retry for a network or 5xx failure, none for a 4xx the user must
        // fix. The client toasts once per message, so a retry adds no toast.
        retry: retryOnceUnlessClientError,
        // Off on purpose: a list the user is filtering or editing must not
        // jump under them when the tab regains focus. Mutations invalidate
        // what they change; Home (`qk.overview`) refreshes on its next visit
        // after the 5 s above, and is not invalidated by entity mutations.
        // If Home shows stale numbers in practice, invalidate `qk.overview`
        // in the entity mutations.
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/**
 * One cache for the whole app. Route loaders prefetch into it through the
 * router context and components read it through QueryProvider, so a loader
 * and a hook that share `queryOptions` can never drift apart.
 */
export const queryClient = createAppQueryClient();
