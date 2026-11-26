import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import i18n from '@/lib/i18n/i18n';
import { queryClient as appQueryClient } from '@/lib/query-client';

interface QueryProviderProps {
  children: React.ReactNode;
  /** Defaults to the app singleton, the same one the router context carries. */
  client?: QueryClient;
}

export function QueryProvider({
  children,
  client = appQueryClient,
}: QueryProviderProps) {
  // Server messages and labels come back in the UI language, so refetch them.
  useEffect(() => {
    const onLanguageChanged = () => {
      void client.invalidateQueries();
    };
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
