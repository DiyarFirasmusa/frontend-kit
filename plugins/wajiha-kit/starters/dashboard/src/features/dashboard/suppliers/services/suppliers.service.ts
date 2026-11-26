import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import { toBackendSort } from '@/utils/table-state';
import type {
  SupplierDetail,
  SupplierListParams,
  SupplierListResponse,
  SupplierPayload,
  SupplierRow,
} from '../types/types';

interface RequestOptions {
  signal?: AbortSignal;
}

/** UI params -> the backend's names: 0-based `page`, `size`, `sort=name,asc`. */
export function toSupplierListQuery(
  params: SupplierListParams,
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
  return query;
}

export async function fetchSuppliers(
  params: SupplierListParams,
  options?: RequestOptions,
): Promise<SupplierListResponse> {
  const { data } = await privateApi.get<SupplierListResponse>(
    endpoints.suppliers.list,
    { params: toSupplierListQuery(params), signal: options?.signal },
  );
  return data;
}

export async function fetchSupplier(
  id: string,
  options?: RequestOptions,
): Promise<SupplierDetail> {
  const { data } = await privateApi.get<SupplierDetail>(
    endpoints.suppliers.detail(id),
    { signal: options?.signal },
  );
  return data;
}

export async function createSupplier(
  payload: SupplierPayload,
): Promise<SupplierRow> {
  const { data } = await privateApi.post<SupplierRow>(
    endpoints.suppliers.create,
    payload,
    { successMessage: 'suppliers.messages.created' },
  );
  return data;
}

export async function updateSupplier(
  id: string,
  payload: SupplierPayload,
): Promise<SupplierRow> {
  const { data } = await privateApi.put<SupplierRow>(
    endpoints.suppliers.update(id),
    payload,
    { successMessage: 'suppliers.messages.updated' },
  );
  return data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await privateApi.delete(endpoints.suppliers.remove(id), {
    successMessage: 'suppliers.messages.deleted',
  });
}
