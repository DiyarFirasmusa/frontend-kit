import { createFileRoute } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import WarehousesListContainer from '@/features/dashboard/warehouses';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_app/warehouses/')({
  beforeLoad: () => {
    requirePermission(PERMS.warehouse.view);
  },
  loader: () => loadFeatureLocale('dashboard/warehouses'),
  component: WarehousesListContainer,
});
