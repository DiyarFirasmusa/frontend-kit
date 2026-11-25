import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getErrorStatus } from '@/api/error/api-error';
import i18n from '@/lib/i18n/i18n';

interface QueryProviderProps {
  children: React.ReactNode;
}

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

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5_000,
            gcTime: 5_000,
            retry: retryOnceUnlessClientError,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    const onLanguageChanged = () => {
      void queryClient.invalidateQueries();
    };
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
