import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import { toBackendSort } from '@/utils/table-state';
import type {
  WarehouseDetail,
  WarehouseListParams,
  WarehouseListResponse,
  WarehousePayload,
  WarehouseRow,
} from '../types/types';

interface RequestOptions {
  signal?: AbortSignal;
}

/** UI params -> the backend's names: 0-based `page`, `size`, `sort=name,asc`. */
export function toWarehouseListQuery(
  params: WarehouseListParams,
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    page: params.page - 1,
    size: params.pageSize,
  };
  const sort = toBackendSort(params.sort);
  if (sort) {
    query.sort = sort;
  }
  if (params.q) {
    query.q = params.q;
  }
  if (params.status !== 'all') {
    query.isActive = params.status === 'active';
  }
  if (params.type !== 'all') {
    query.isTransit = params.type === 'transit';
  }
  return query;
}

export async function fetchWarehouses(
  params: WarehouseListParams,
  options?: RequestOptions,
): Promise<WarehouseListResponse> {
  const { data } = await privateApi.get<WarehouseListResponse>(
    endpoints.warehouses.list,
    { params: toWarehouseListQuery(params), signal: options?.signal },
  );
  return data;
}

export async function fetchWarehouse(
  id: string,
  options?: RequestOptions,
): Promise<WarehouseDetail> {
  const { data } = await privateApi.get<WarehouseDetail>(
    endpoints.warehouses.detail(id),
    // The detail page renders its own "not found" result, so no error toast.
    { signal: options?.signal, silentErrorStatuses: [404] },
  );
  return data;
}

export async function createWarehouse(
  payload: WarehousePayload,
): Promise<WarehouseRow> {
  const { data } = await privateApi.post<WarehouseRow>(
    endpoints.warehouses.create,
    payload,
    { successMessage: 'warehouses.messages.created' },
  );
  return data;
}

export async function updateWarehouse(
  id: string,
  payload: WarehousePayload,
): Promise<WarehouseRow> {
  const { data } = await privateApi.put<WarehouseRow>(
    endpoints.warehouses.update(id),
    payload,
    { successMessage: 'warehouses.messages.updated' },
  );
  return data;
}

export async function deleteWarehouse(id: string): Promise<void> {
  await privateApi.delete(endpoints.warehouses.remove(id), {
    successMessage: 'warehouses.messages.deleted',
  });
}
