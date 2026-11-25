import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchSuppliers } from '../../services/suppliers.service';
import type { SupplierListParams } from '../../types/types';

export function useSuppliersList(params: SupplierListParams) {
  return useQuery({
    queryKey: qk.suppliers.list(params),
    queryFn: () => fetchSuppliers(params),
    placeholderData: keepPreviousData,
  });
}
