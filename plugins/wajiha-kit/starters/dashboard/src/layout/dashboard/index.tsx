import type { ReactNode } from 'react';
import { AppErrorView } from '@/features/fallback/app-error-view';
import { useAppError } from './hooks/use-app-error';
import { MobileSidebar } from './sidebar/components/mobile-sidebar';
import { DashboardSidebar } from './sidebar/components/sidebar';
import { DashboardTopbar } from './topbar/components/topbar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const appError = useAppError();
  return (
    <div className="flex min-h-svh">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileSidebar />
        <DashboardTopbar />
        <main className="md:p-page w-full flex-1 p-4">
          {appError ? <AppErrorView error={appError} /> : null}
          <div hidden={appError !== null}>{children}</div>
        </main>
      </div>
    </div>
  );
}
