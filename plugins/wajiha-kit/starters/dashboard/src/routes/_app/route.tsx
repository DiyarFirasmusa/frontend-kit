import { Outlet, createFileRoute } from '@tanstack/react-router';
import { PageLoading } from '@/features/fallback/page-loading';
import { RouteErrorView } from '@/features/fallback/route-error-view';
import { requireAuth } from '@/guards/route-guards';
import { DashboardLayout } from '@/layout/dashboard';
import { reportError } from '@/lib/monitoring';

function DashboardShell() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export const Route = createFileRoute('/_app')({
  beforeLoad: ({ location }) => {
    requireAuth(location);
  },
  component: DashboardShell,
  errorComponent: RouteErrorView,
  // Reports what this boundary catches (a crashed page keeps the shell).
  onCatch: (error) => {
    void reportError(error, { boundary: 'app' });
  },
  pendingComponent: PageLoading,
});
