import { createFileRoute } from '@tanstack/react-router';
import { adminHead } from '@/features/admin/layout/admin-head';
import { OverviewPage } from '@/features/admin/overview';

export const Route = createFileRoute('/$locale_/admin/_shell/')({
  head: adminHead('overview.title'),
  component: OverviewPage,
});
