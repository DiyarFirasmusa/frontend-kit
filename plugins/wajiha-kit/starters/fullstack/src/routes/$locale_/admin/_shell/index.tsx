import { createFileRoute } from '@tanstack/react-router';
import { adminHead } from '@/features/admin/layout/admin-head';
import { OverviewPage } from '@/features/admin/overview';

export const Route = createFileRoute('/$locale_/admin/_shell/')({
  loader: async () => {
    const { prefetchOverview } = await import('@/features/admin/suppliers/prefetch');
    prefetchOverview();
  },
  head: adminHead('overview.title'),
  component: OverviewPage,
});
