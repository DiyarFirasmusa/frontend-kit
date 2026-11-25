import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type {
  WarehouseRequest,
  WarehouseResponse,
} from '@/types/api/warehouses';
import type { WarehouseListParams } from '../types/types';

export async function fetchWarehouses(
  params: WarehouseListParams = {},
): Promise<WarehouseResponse[]> {
  const { data } = await privateApi.get<WarehouseResponse[]>(
    endpoints.warehouses.list,
    { params },
  );
  return data;
}

export async function createWarehouse(
  payload: WarehouseRequest,
): Promise<WarehouseResponse> {
  const { data } = await privateApi.post<WarehouseResponse>(
    endpoints.warehouses.create,
    payload,
    { successMessage: 'warehouses.toasts.created' },
  );
  return data;
}

export async function updateWarehouse(
  id: string,
  payload: WarehouseRequest,
): Promise<WarehouseResponse> {
  const { data } = await privateApi.put<WarehouseResponse>(
    endpoints.warehouses.update(id),
    payload,
    { successMessage: 'warehouses.toasts.updated' },
  );
  return data;
}

export async function deleteWarehouse(id: string): Promise<void> {
  await privateApi.delete(endpoints.warehouses.remove(id), {
    successMessage: 'warehouses.toasts.deleted',
  });
}
