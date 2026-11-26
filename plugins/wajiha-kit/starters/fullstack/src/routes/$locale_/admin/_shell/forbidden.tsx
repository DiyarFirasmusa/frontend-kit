import { createFileRoute } from '@tanstack/react-router';
import { adminHead } from '@/features/admin/layout/admin-head';
import { AdminMessage } from '@/features/admin/layout/admin-message';

export const Route = createFileRoute('/$locale_/admin/_shell/forbidden')({
  head: adminHead('admin.forbiddenTitle'),
  component: () => <AdminMessage kind="forbidden" />,
});
