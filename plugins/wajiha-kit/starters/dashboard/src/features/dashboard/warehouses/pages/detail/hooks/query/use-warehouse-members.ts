import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import type { WarehouseUserRole } from '@/types/api/enums';
import type { WarehouseUserRequest } from '@/types/api/warehouses';
import {
  addWarehouseMember,
  changeWarehouseMemberRole,
  fetchWarehouseMembers,
  removeWarehouseMember,
} from '../../services/warehouse-detail.service';

export function useWarehouseMembers(warehouseId: string) {
  return useQuery({
    queryKey: qk.warehouses.users(warehouseId),
    queryFn: ({ signal }) => fetchWarehouseMembers(warehouseId, { signal }),
    enabled: warehouseId !== '',
  });
}

export function useAddWarehouseMember(warehouseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WarehouseUserRequest) =>
      addWarehouseMember(warehouseId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.warehouses.users(warehouseId) });
    },
  });
}

export function useChangeWarehouseMemberRole(warehouseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { userId: string; role: WarehouseUserRole }) =>
      changeWarehouseMemberRole(warehouseId, vars.userId, { role: vars.role }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.warehouses.users(warehouseId) });
    },
  });
}

export function useRemoveWarehouseMember(warehouseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeWarehouseMember(warehouseId, userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.warehouses.users(warehouseId) });
    },
  });
}
