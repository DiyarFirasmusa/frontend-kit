import { useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchWarehouseLocations } from '../../services/warehouse-detail.service';

export function useWarehouseLocations(warehouseId: string) {
  return useQuery({
    queryKey: qk.warehouses.locations(warehouseId),
    queryFn: () => fetchWarehouseLocations(warehouseId),
    enabled: warehouseId !== '',
  });
}
