import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import {
  createSupplier,
  deleteSupplier,
  updateSupplier,
} from '../../services/suppliers.service';
import type { SupplierPayload } from '../../types/types';

function invalidateSuppliers(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: qk.suppliers.all });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierPayload) => createSupplier(payload),
    onSuccess: () => {
      invalidateSuppliers(qc);
    },
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      id: string;
      payload: SupplierPayload;
      successMessage?: string;
    }) => updateSupplier(vars.id, vars.payload, vars.successMessage),
    onSuccess: () => {
      invalidateSuppliers(qc);
    },
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      invalidateSuppliers(qc);
    },
  });
}
