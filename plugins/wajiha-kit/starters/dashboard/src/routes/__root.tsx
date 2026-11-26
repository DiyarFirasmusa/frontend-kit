import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryProvider } from '@/context/query-provider';
import { ThemeProvider } from '@/context/theme-provider';
import NotFoundErrorContainer from '@/features/fallback/404';
import { RootErrorFallback } from '@/features/fallback/root-error-fallback';
import { getDir } from '@/lib/i18n/i18n';
import { reportError } from '@/lib/monitoring';
import type { RouterContext } from '@/router';

/* Devtools ship only in `npm run dev`; the lazy import keeps them out of the
   production bundle entirely. They are also hidden under VITE_ENV=test so the
   Playwright/axe runs see the app's DOM alone. */
const DevTools =
  import.meta.env.DEV && import.meta.env.VITE_ENV !== 'test'
    ? lazy(() => import('@/lib/devtools'))
    : () => null;

/* Last-resort boundary: a render error anywhere above the layout groups
   (providers, i18n, theme) lands here instead of a blank page. */
export const Route = createRootRouteWithContext<RouterContext>()({
  notFoundComponent: () => <NotFoundErrorContainer />,
  errorComponent: ({ error }) => <RootErrorFallback error={error} />,
  // onCatch, not onError: the boundary sees render and loader errors alike,
  // and main.tsx leaves caught errors to the boundaries (reported once).
  onCatch: (error) => {
    void reportError(error, { boundary: 'root' });
  },
  component: RootShell,
});

function RootShell() {
  const { i18n } = useTranslation();
  // The same client the loaders prefetch into (tests pass their own).
  const { queryClient } = Route.useRouteContext();
  const lang = i18n.resolvedLanguage ?? i18n.language;
  const dir = getDir(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <ThemeProvider>
      <QueryProvider client={queryClient}>
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
