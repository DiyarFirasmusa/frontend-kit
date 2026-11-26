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
        retry: retryOnceUnlessClientError,
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
