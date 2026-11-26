import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchSuppliers } from '../../services/suppliers.service';
import type { SupplierListParams } from '../../types/types';

/** Shared by the route loader (prefetch) and the page (read). */
export function suppliersListQueryOptions(params: SupplierListParams) {
  return queryOptions({
    queryKey: qk.suppliers.list(params),
    // The signal aborts the request when the page or the params change.
    queryFn: ({ signal }) => fetchSuppliers(params, { signal }),
    // The previous page stays on screen while the next one loads.
    placeholderData: keepPreviousData,
  });
}

export function useSuppliersList(params: SupplierListParams) {
  return useQuery(suppliersListQueryOptions(params));
}
