import { queryOptions, useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchSupplier } from '../../services/suppliers.service';

export function supplierDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: qk.suppliers.detail(id),
    queryFn: ({ signal }) => fetchSupplier(id, { signal }),
  });
}

/** Edit reads the record by id, never the possibly stale table row. */
export function useSupplierDetail(id: string | null) {
  return useQuery({
    ...supplierDetailQueryOptions(id ?? ''),
    enabled: id !== null,
  });
}
