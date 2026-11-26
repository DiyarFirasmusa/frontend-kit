import { createFileRoute } from '@tanstack/react-router';
import { OverviewPage } from '@/features/admin/overview';

export const Route = createFileRoute('/$locale_/admin/_shell/')({
  component: OverviewPage,
});
