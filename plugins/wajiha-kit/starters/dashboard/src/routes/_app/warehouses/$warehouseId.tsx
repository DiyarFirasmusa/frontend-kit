import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import { warehouseDetailQueryOptions } from '@/features/dashboard/warehouses/hooks/query/use-warehouse-detail';
import WarehouseDetailContainer from '@/features/dashboard/warehouses/pages/detail';
import {
  defaultWarehouseDetailSearch,
  warehouseDetailSearchSchema,
} from '@/features/dashboard/warehouses/pages/detail/validations/search';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

function RouteComponent() {
  const { warehouseId } = Route.useParams();
  const { tab } = Route.useSearch();
  return <WarehouseDetailContainer warehouseId={warehouseId} tab={tab} />;
}

export const Route = createFileRoute('/_app/warehouses/$warehouseId')({
  validateSearch: warehouseDetailSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultWarehouseDetailSearch)],
  },
  beforeLoad: () => {
    requirePermission(PERMS.warehouse.view);
  },
  loader: async ({ context, params }) => {
    // Wait for existence, not freshness: cached data is enough to open the
    // page, and the hook refetches it in the background when stale. A 404
    // is not thrown here: the page shows its own "not found" result.
    await context.queryClient
      .query({
        ...warehouseDetailQueryOptions(params.warehouseId),
        staleTime: 'static',
      })
      .catch(() => null);
    return loadFeatureLocale('dashboard/warehouses');
  },
  component: RouteComponent,
});
