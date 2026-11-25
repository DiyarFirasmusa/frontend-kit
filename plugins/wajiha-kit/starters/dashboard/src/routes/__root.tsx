import {
  HeadContent,
  Outlet,
  createRootRoute,
  useNavigate,
} from '@tanstack/react-router';
import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { onSessionExpired } from '@/api/auth/session-events';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryProvider } from '@/context/query-provider';
import { ThemeProvider } from '@/context/theme-provider';
import NotFoundErrorContainer from '@/features/fallback/404';
import { RootErrorFallback } from '@/features/fallback/root-error-fallback';
import { getDir } from '@/lib/i18n/i18n';
import { reportError } from '@/lib/monitoring';

/* Devtools ship only in `npm run dev`; the lazy import keeps them out of the
   production bundle entirely. They are also hidden under VITE_ENV=test so the
   Playwright/axe runs see the app's DOM alone. */
const DevTools =
  import.meta.env.DEV && import.meta.env.VITE_ENV !== 'test'
    ? lazy(() => import('@/lib/devtools'))
    : () => null;

/* Last-resort boundary: a render error anywhere above the layout groups
   (providers, i18n, theme) lands here instead of a blank page. */
export const Route = createRootRoute({
  notFoundComponent: () => <NotFoundErrorContainer />,
  errorComponent: ({ error }) => <RootErrorFallback error={error} />,
  onError: (error) => {
    void reportError(error, { boundary: 'root' });
  },
  component: RootShell,
});

function RootShell() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.resolvedLanguage ?? i18n.language;
  const dir = getDir(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  // A finished session (401 and no refresh) moves to /login through the router.
  useEffect(
    () =>
      onSessionExpired(() => {
        void navigate({ to: '/login' });
      }),
    [navigate],
  );

  return (
    <ThemeProvider>
      <QueryProvider>
        <TooltipProvider>
          <HeadContent />
          <div className="bg-background text-text-primary min-h-svh">
            <Outlet />
          </div>
          <Toaster richColors closeButton />
          <Suspense fallback={null}>
            <DevTools />
          </Suspense>
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
