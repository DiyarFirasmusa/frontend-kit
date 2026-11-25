import { createFileRoute } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import WarehouseDetailContainer from '@/features/dashboard/warehouses/pages/detail';
import {
  WAREHOUSE_DETAIL_TABS,
  type WarehouseDetailTab,
} from '@/features/dashboard/warehouses/pages/detail/types/types';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

function toDetailTab(value: unknown): WarehouseDetailTab {
  const match = WAREHOUSE_DETAIL_TABS.find((tab) => tab === value);
  return match ?? 'overview';
}

function RouteComponent() {
  const { warehouseId } = Route.useParams();
  const { tab } = Route.useSearch();
  return (
    <WarehouseDetailContainer
      warehouseId={warehouseId}
      tab={tab ?? 'overview'}
    />
  );
}

export const Route = createFileRoute('/_dashboard/warehouses/$warehouseId')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { tab?: WarehouseDetailTab } => {
    const tab = toDetailTab(search.tab);
    return tab === 'overview' ? {} : { tab };
  },
  beforeLoad: () => {
    requirePermission(PERMS.warehouse.read);
  },
  loader: () => loadFeatureLocale('dashboard/warehouses'),
  component: RouteComponent,
});
