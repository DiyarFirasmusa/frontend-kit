import { createFileRoute } from '@tanstack/react-router';
import { adminHead } from '@/features/admin/layout/admin-head';
import { SettingsPage } from '@/features/admin/settings';

export const Route = createFileRoute('/$locale_/admin/_shell/settings')({
  head: adminHead('settings.title'),
  component: SettingsPage,
});
