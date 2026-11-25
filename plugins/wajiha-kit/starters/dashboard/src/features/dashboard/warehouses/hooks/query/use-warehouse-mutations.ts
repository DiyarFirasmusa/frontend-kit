import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import type { WarehouseRequest } from '@/types/api/warehouses';
import {
  createWarehouse,
  deleteWarehouse,
  updateWarehouse,
} from '../../services/warehouses.service';

function invalidateWarehouseMasterData(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: qk.warehouses.all });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WarehouseRequest) => createWarehouse(payload),
    onSuccess: () => {
      invalidateWarehouseMasterData(qc);
    },
  });
}

export function useUpdateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; payload: WarehouseRequest }) =>
      updateWarehouse(vars.id, vars.payload),
    onSuccess: () => {
      invalidateWarehouseMasterData(qc);
    },
  });
}

export function useDeleteWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(id),
    onSuccess: () => {
      invalidateWarehouseMasterData(qc);
    },
  });
}
