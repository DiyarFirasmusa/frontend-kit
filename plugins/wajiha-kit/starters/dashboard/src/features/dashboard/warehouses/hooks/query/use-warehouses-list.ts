import { useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchWarehouses } from '../../services/warehouses.service';
import type { WarehouseListParams } from '../../types/types';

export function useWarehousesList(params: WarehouseListParams) {
  return useQuery({
    queryKey: qk.warehouses.list(params),
    queryFn: () => fetchWarehouses(params),
  });
}
