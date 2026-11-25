import { useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchWarehouse } from '../../services/warehouse-detail.service';

export function useWarehouseDetails(id: string) {
  return useQuery({
    queryKey: qk.warehouses.detail(id),
    queryFn: () => fetchWarehouse(id),
    enabled: id !== '',
  });
}
