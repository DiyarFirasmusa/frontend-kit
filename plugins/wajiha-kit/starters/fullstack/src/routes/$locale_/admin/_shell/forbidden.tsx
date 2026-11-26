import { createFileRoute } from '@tanstack/react-router';
import { AdminMessage } from '@/features/admin/layout/admin-message';

export const Route = createFileRoute('/$locale_/admin/_shell/forbidden')({
  component: () => <AdminMessage kind="forbidden" />,
});
