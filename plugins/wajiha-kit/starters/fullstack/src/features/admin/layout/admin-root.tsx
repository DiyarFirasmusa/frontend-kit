import { CSPProvider } from '@base-ui/react/csp-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import { Outlet, useNavigate, useRouter } from '@tanstack/react-router';
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
  const router = useRouter();

  useEffect(
    () =>
      onSessionExpired(() => {
        // Read the page at the moment of the event, not at render time: a second 401 that arrives while
        // the login page is showing must not make the login page its own return address.
        const { pathname, href } = router.state.location;
        if (pathname.endsWith('/login')) {
          return;
        }
        void queryClient.cancelQueries();
        void navigate({
          to: '/$locale/admin/login',
          params: { locale },
          search: { redirect: href, reason: 'expired' },
          replace: true,
        }).then(() => {
          queryClient.clear();
        });
      }),
    [locale, navigate, queryClient, router],
  );

  return (
    // disableStyleElements: Base UI would inject <style> elements, which style-src 'self' blocks (the
    // rules it needs are in src/style/select.css).
    <CSPProvider disableStyleElements>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Outlet />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </CSPProvider>
  );
}
