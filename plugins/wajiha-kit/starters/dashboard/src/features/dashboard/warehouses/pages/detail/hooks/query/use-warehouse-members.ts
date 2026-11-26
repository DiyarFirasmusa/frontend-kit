import {
  type QueryClient,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import type { WarehouseUserRole } from '@/types/api/enums';
import type { WarehouseUserRequest } from '@/types/api/warehouses';
import {
  addWarehouseMember,
  changeWarehouseMemberRole,
  fetchWarehouseMembers,
  removeWarehouseMember,
} from '../../services/warehouse-detail.service';

export function warehouseMembersQueryOptions(warehouseId: string) {
  return queryOptions({
    queryKey: qk.warehouses.users(warehouseId),
    queryFn: ({ signal }) => fetchWarehouseMembers(warehouseId, { signal }),
  });
}

export function useWarehouseMembers(warehouseId: string) {
  return useQuery({
    ...warehouseMembersQueryOptions(warehouseId),
    enabled: warehouseId !== '',
  });
}

/**
 * Returning the promise keeps `isPending` true until the members have
 * refetched. Adding or removing a member also changes the `memberCount` the
 * warehouses list shows and exports.
 */
function refreshMembersAndCount(qc: QueryClient, warehouseId: string) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: qk.warehouses.users(warehouseId) }),
    qc.invalidateQueries({ queryKey: qk.warehouses.lists() }),
  ]);
}

export function useAddWarehouseMember(warehouseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WarehouseUserRequest) =>
      addWarehouseMember(warehouseId, payload),
    onSuccess: () => refreshMembersAndCount(qc, warehouseId),
  });
}

export function useChangeWarehouseMemberRole(warehouseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { userId: string; role: WarehouseUserRole }) =>
      changeWarehouseMemberRole(warehouseId, vars.userId, { role: vars.role }),
    // A role change leaves the list's member count alone.
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.warehouses.users(warehouseId) }),
  });
}

export function useRemoveWarehouseMember(warehouseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeWarehouseMember(warehouseId, userId),
    onSuccess: () => refreshMembersAndCount(qc, warehouseId),
  });
}
