import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type {
  LocationResponse,
  WarehouseUserRequest,
  WarehouseUserResponse,
  WarehouseUserRoleRequest,
} from '@/types/api/warehouses';

/** `signal` comes from TanStack Query, so a cancelled query aborts the request. */
interface RequestOptions {
  signal?: AbortSignal;
}

export async function fetchWarehouseMembers(
  id: string,
  options: RequestOptions = {},
): Promise<WarehouseUserResponse[]> {
  const { data } = await privateApi.get<WarehouseUserResponse[]>(
    endpoints.warehouses.users(id),
    { signal: options.signal },
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
    { successMessage: 'warehouses.messages.memberAdded' },
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
    { successMessage: 'warehouses.messages.memberRoleChanged' },
  );
  return data;
}

export async function removeWarehouseMember(
  id: string,
  userId: string,
): Promise<void> {
  await privateApi.delete(endpoints.warehouses.removeUser(id, userId), {
    successMessage: 'warehouses.messages.memberRemoved',
  });
}

export async function fetchWarehouseLocations(
  id: string,
  options: RequestOptions = {},
): Promise<LocationResponse[]> {
  const { data } = await privateApi.get<LocationResponse[]>(
    endpoints.warehouses.locations(id),
    { signal: options.signal },
  );
  return data;
}
