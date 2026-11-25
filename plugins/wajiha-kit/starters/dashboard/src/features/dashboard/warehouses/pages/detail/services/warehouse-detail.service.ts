import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type {
  LocationResponse,
  WarehouseResponse,
  WarehouseUserRequest,
  WarehouseUserResponse,
  WarehouseUserRoleRequest,
} from '@/types/api/warehouses';

export async function fetchWarehouse(id: string): Promise<WarehouseResponse> {
  const { data } = await privateApi.get<WarehouseResponse>(
    endpoints.warehouses.detail(id),
  );
  return data;
}

export async function fetchWarehouseMembers(
  id: string,
): Promise<WarehouseUserResponse[]> {
  const { data } = await privateApi.get<WarehouseUserResponse[]>(
    endpoints.warehouses.users(id),
  );
  return data;
}

export async function addWarehouseMember(
  id: string,
  payload: WarehouseUserRequest,
): Promise<WarehouseUserResponse> {
  const { data } = await privateApi.post<WarehouseUserResponse>(
    endpoints.warehouses.users(id),
    payload,
    { successMessage: 'warehouses.toasts.memberAdded' },
  );
  return data;
}

export async function changeWarehouseMemberRole(
  id: string,
  userId: string,
  payload: WarehouseUserRoleRequest,
): Promise<WarehouseUserResponse> {
  const { data } = await privateApi.put<WarehouseUserResponse>(
    endpoints.warehouses.changeUserRole(id, userId),
    payload,
    { successMessage: 'warehouses.toasts.memberRoleChanged' },
  );
  return data;
}

export async function removeWarehouseMember(
  id: string,
  userId: string,
): Promise<void> {
  await privateApi.delete(endpoints.warehouses.removeUser(id, userId), {
    successMessage: 'warehouses.toasts.memberRemoved',
  });
}

export async function fetchWarehouseLocations(
  id: string,
): Promise<LocationResponse[]> {
  const { data } = await privateApi.get<LocationResponse[]>(
    endpoints.warehouses.locations(id),
  );
  return data;
}
