import { Outlet, createFileRoute } from '@tanstack/react-router';
import { PageLoading } from '@/features/fallback/page-loading';
import { RouteErrorView } from '@/features/fallback/route-error-view';
import { requireAuth } from '@/guards/route-guards';
import { DashboardLayout } from '@/layout/dashboard';

function DashboardShell() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: () => {
    requireAuth();
  },
  component: DashboardShell,
  errorComponent: RouteErrorView,
  pendingComponent: PageLoading,
});
