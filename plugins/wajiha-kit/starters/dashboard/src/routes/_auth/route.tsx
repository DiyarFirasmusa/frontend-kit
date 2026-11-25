import { Outlet, createFileRoute } from '@tanstack/react-router';
import ServerError from '@/features/fallback/500';
import { requireGuest } from '@/guards/route-guards';
import { AuthLayout } from '@/layout/auth';

function AuthShell() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    requireGuest();
  },
  component: AuthShell,
  errorComponent: ServerError,
});
