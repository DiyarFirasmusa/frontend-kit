import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import type { Locale } from '@/shared/lib/i18n/languages';
import { endSession } from '../store/session';

type Navigate = ReturnType<typeof useNavigate>;

export type EndSessionOptions = {
  /** Where to come back to after the next sign-in (a 401 on a page remembers that page). */
  redirect?: string;
  /** Why the session ended: the login page says so. */
  reason?: 'expired';
};

/**
 * The one place the admin leaves a session, for sign-out and for a 401: stop in-flight and background
 * requests (they would come back without a token), forget the session, go to the login page, and drop
 * the cached data only after the move (the page that shows it is gone by then).
 */
export function endAdminSession({
  queryClient,
  navigate,
  locale,
  redirect,
  reason,
}: EndSessionOptions & { queryClient: QueryClient; navigate: Navigate; locale: Locale }): void {
  void queryClient.cancelQueries();
  endSession();
  const search = {
    ...(redirect === undefined ? {} : { redirect }),
    ...(reason === undefined ? {} : { reason }),
  };
  void navigate({
    to: '/$locale/admin/login',
    params: { locale },
    search,
    // A forced end (401) replaces the page the user was on: Back must not return to a dead page.
    replace: reason !== undefined,
  }).then(() => {
    queryClient.clear();
  });
}

/** `endAdminSession` for components inside the admin's providers. */
export function useEndSession(locale: Locale): (options?: EndSessionOptions) => void {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useCallback(
    (options = {}) => {
      endAdminSession({ queryClient, navigate, locale, ...options });
    },
    [queryClient, navigate, locale],
  );
}
