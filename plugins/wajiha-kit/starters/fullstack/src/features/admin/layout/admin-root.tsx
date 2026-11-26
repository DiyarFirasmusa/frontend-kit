import { QueryClientProvider } from '@tanstack/react-query';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Locale } from '@/shared/lib/i18n/languages';
import { onSessionExpired } from '../api/session-events';
import { createAdminQueryClient } from '../lib/query-client';

/**
 * Everything the admin owns, mounted by its layout route: its own QueryClient (the public site has none),
 * the toast region, tooltips, and the "session ended" listener that sends the user back to login.
 */
export function AdminRoot({ locale }: { locale: Locale }) {
  const [queryClient] = useState(createAdminQueryClient);
  const navigate = useNavigate();
  const href = useRouterState({ select: (state) => state.location.href });

  useEffect(
    () =>
      onSessionExpired(() => {
        queryClient.clear();
        void navigate({
          to: '/$locale/admin/login',
          params: { locale },
          search: { redirect: href },
        });
      }),
    [href, locale, navigate, queryClient],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Outlet />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

/** Shown while the admin's code, text and (in mock mode) the mock API start. */
export function AdminLoading() {
  return (
    <div className="bg-background grid min-h-dvh place-items-center">
      <span className="border-stroke-strong border-t-primary size-8 animate-spin rounded-full border-2" />
    </div>
  );
}
