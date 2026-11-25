import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataBadge } from '@/components/table/data-badge';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useAppErrorStore, type AppError } from '@/store/app-error-store';
import { ErrorPage } from './error-page';
import { buildErrorDetails } from './utils/error-details';

interface AppErrorViewProps {
  error: AppError;
}

/**
 * Replaces the page content inside the dashboard shell while a page-level
 * request failure is active (lost network or a 5xx while loading data). Retry
 * clears the error and refetches every active query; a network error also
 * retries by itself the moment the browser comes back online.
 */
export function AppErrorView({ error }: AppErrorViewProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clear = useAppErrorStore((s) => s.clear);
  const isOnline = useOnlineStatus();
  const page = useRouterState({ select: (s) => s.location.pathname });

  const retry = useCallback(() => {
    clear();
    void queryClient.refetchQueries({ type: 'active' });
  }, [clear, queryClient]);

  useEffect(() => {
    if (error.kind !== 'network') {
      return;
    }
    window.addEventListener('online', retry);
    return () => {
      window.removeEventListener('online', retry);
    };
  }, [error.kind, retry]);

  return (
    <ErrorPage
      kind={error.kind}
      primary={{ label: t('errorPages.retry'), onClick: retry }}
      secondary={{
        label: t('errorPages.goHome'),
        onClick: () => {
          clear();
          void navigate({ to: '/' });
        },
      }}
      status={
        error.kind === 'network' ? (
          <DataBadge tone={isOnline ? 'info' : 'warning'} shape="pill">
            {t(
              isOnline
                ? 'errorPages.network.online'
                : 'errorPages.network.offline',
            )}
          </DataBadge>
        ) : null
      }
      details={buildErrorDetails(t, { ...error, page })}
    />
  );
}
