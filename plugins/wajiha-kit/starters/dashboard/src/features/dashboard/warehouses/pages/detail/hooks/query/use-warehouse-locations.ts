import { queryOptions, useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchWarehouseLocations } from '../../services/warehouse-detail.service';

export function warehouseLocationsQueryOptions(warehouseId: string) {
  return queryOptions({
    queryKey: qk.warehouses.locations(warehouseId),
    queryFn: ({ signal }) => fetchWarehouseLocations(warehouseId, { signal }),
  });
}

export function useWarehouseLocations(warehouseId: string) {
  return useQuery({
    ...warehouseLocationsQueryOptions(warehouseId),
    enabled: warehouseId !== '',
  });
}
