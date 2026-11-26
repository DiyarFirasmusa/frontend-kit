import { QueryClient } from '@tanstack/react-query';
import { errorStatus } from '../api/errors';

/** One per admin layout mount. Errors are shown by the API layer (toasts) or by the page itself. */
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
