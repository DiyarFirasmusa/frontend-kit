import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchWarehouses } from '../../services/warehouses.service';
import type { WarehouseListParams } from '../../types/types';

/** Shared by the route loader (prefetch) and the page (read). */
export function warehousesListQueryOptions(params: WarehouseListParams) {
  return queryOptions({
    queryKey: qk.warehouses.list(params),
    // The signal aborts the request when the page or the params change.
    queryFn: ({ signal }) => fetchWarehouses(params, { signal }),
    // The previous page stays on screen while the next one loads.
    placeholderData: keepPreviousData,
  });
}

export function useWarehousesList(params: WarehouseListParams) {
  return useQuery(warehousesListQueryOptions(params));
}
