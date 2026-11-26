import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import WarehousesListContainer from '@/features/dashboard/warehouses';
import { warehousesListQueryOptions } from '@/features/dashboard/warehouses/hooks/query/use-warehouses-list';
import { toWarehouseListParams } from '@/features/dashboard/warehouses/utils/list-params';
import {
  defaultWarehouseSearch,
  warehouseSearchSchema,
} from '@/features/dashboard/warehouses/validations/search';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_app/warehouses/')({
  validateSearch: warehouseSearchSchema,
  search: { middlewares: [stripSearchParams(defaultWarehouseSearch)] },
  beforeLoad: () => {
    requirePermission(PERMS.warehouse.view);
  },
  loaderDeps: ({ search }) => toWarehouseListParams(search),
  loader: ({ context, deps }) => {
    // Start the fetch, do not wait: the table keeps the previous page meanwhile.
    void context.queryClient
      .query(warehousesListQueryOptions(deps))
      .catch(() => null);
    return loadFeatureLocale('dashboard/warehouses');
  },
  component: WarehousesListContainer,
});
