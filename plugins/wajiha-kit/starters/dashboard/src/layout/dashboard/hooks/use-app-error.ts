import { useRouterState } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useAppErrorStore, type AppError } from '@/store/app-error-store';

/**
 * The page-level error the shell shows instead of the current page. Going
 * offline raises the network error straight away; navigating to another page
 * clears whatever error belonged to the previous one.
 */
export function useAppError(): AppError | null {
  const error = useAppErrorStore((s) => s.error);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      useAppErrorStore.getState().clear();
    }
  }, [pathname]);

  useEffect(() => {
    const onOffline = () => {
      useAppErrorStore.getState().setError({
        kind: 'network',
        status: null,
        method: 'GET',
        path: '',
        correlationId: null,
        occurredAt: new Date().toISOString(),
      });
    };
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return error;
}
