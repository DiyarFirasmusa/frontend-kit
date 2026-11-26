import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { qk } from '../api/query-keys';
import type { SupplierListParams, SupplierRequest } from '../types/api';
import {
  createSupplier,
  deleteSupplier,
  fetchSuppliers,
  updateSupplier,
} from './suppliers.service';

/** One list page: the page hook and the route loader (prefetch.ts) build it from the same params. */
export const suppliersListQueryOptions = (params: SupplierListParams) =>
  queryOptions({
    queryKey: qk.suppliers.list(params),
    queryFn: () => fetchSuppliers(params),
  });

export function useSuppliersList(params: SupplierListParams) {
  return useQuery({
    ...suppliersListQueryOptions(params),
    // Keep the current page on screen while the next one loads, so the table does not jump.
    placeholderData: keepPreviousData,
  });
}

/** Every change also refreshes the overview numbers. */
function useInvalidateSuppliers() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: qk.suppliers.all });
    void queryClient.invalidateQueries({ queryKey: qk.overview });
  };
}

export function useCreateSupplier() {
  const invalidate = useInvalidateSuppliers();
  return useMutation({
    mutationFn: (payload: SupplierRequest) => createSupplier(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateSupplier() {
  const invalidate = useInvalidateSuppliers();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SupplierRequest }) =>
      updateSupplier(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteSupplier() {
  const invalidate = useInvalidateSuppliers();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: invalidate,
  });
}
