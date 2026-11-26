import { queryOptions, useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchWarehouse } from '../../services/warehouses.service';

/** Shared by the detail route's loader and the hooks that read the record. */
export function warehouseDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: qk.warehouses.detail(id),
    queryFn: ({ signal }) => fetchWarehouse(id, { signal }),
  });
}

/** Edit and the detail page read the record by id, never the possibly stale table row. */
export function useWarehouseDetail(id: string | null) {
  return useQuery({
    ...warehouseDetailQueryOptions(id ?? ''),
    enabled: id !== null && id !== '',
  });
}
