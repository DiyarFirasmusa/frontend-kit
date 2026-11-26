import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import {
  createSupplier,
  deleteSupplier,
  updateSupplier,
} from '../../services/suppliers.service';
import type { SupplierPayload } from '../../types/types';

// Returning the promise keeps `isPending` true until the list has refetched,
// so the dialog closes on fresh data and a second click cannot slip in.
export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierPayload) => createSupplier(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.suppliers.all }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: SupplierPayload }) =>
      updateSupplier(vars.id, vars.payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.suppliers.all }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: (_data, id) => {
      // Drop the deleted record first: invalidating it would refetch a 404.
      qc.removeQueries({ queryKey: qk.suppliers.detail(id) });
      return qc.invalidateQueries({ queryKey: qk.suppliers.lists() });
    },
  });
}
