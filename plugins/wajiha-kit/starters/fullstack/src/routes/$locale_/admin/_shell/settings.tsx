import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/features/admin/settings';

export const Route = createFileRoute('/$locale_/admin/_shell/settings')({
  component: SettingsPage,
});
