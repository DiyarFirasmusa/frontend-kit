import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import { toBackendSort } from '@/utils/table-state';
import type {
  UnitOfMeasureDetail,
  UnitOfMeasureListParams,
  UnitOfMeasureListResponse,
  UnitOfMeasurePayload,
  UnitOfMeasureRow,
} from '../types/types';

interface RequestOptions {
  signal?: AbortSignal;
}

/** UI params -> the backend's names: 0-based `page`, `size`, `sort=name,asc`. */
export function toUnitOfMeasureListQuery(
  params: UnitOfMeasureListParams,
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
  if (params.decimals !== 'all') {
    query.decimalPlaces = Number(params.decimals);
  }
  return query;
}

export async function fetchUnitsOfMeasure(
  params: UnitOfMeasureListParams,
  options?: RequestOptions,
): Promise<UnitOfMeasureListResponse> {
  const { data } = await privateApi.get<UnitOfMeasureListResponse>(
    endpoints.unitsOfMeasure.list,
    { params: toUnitOfMeasureListQuery(params), signal: options?.signal },
  );
  return data;
}

export async function fetchUnitOfMeasure(
  id: string,
  options?: RequestOptions,
): Promise<UnitOfMeasureDetail> {
  const { data } = await privateApi.get<UnitOfMeasureDetail>(
    endpoints.unitsOfMeasure.detail(id),
    { signal: options?.signal },
  );
  return data;
}

export async function createUnitOfMeasure(
  payload: UnitOfMeasurePayload,
): Promise<UnitOfMeasureRow> {
  const { data } = await privateApi.post<UnitOfMeasureRow>(
    endpoints.unitsOfMeasure.create,
    payload,
    { successMessage: 'unitsOfMeasure.messages.created' },
  );
  return data;
}

export async function updateUnitOfMeasure(
  id: string,
  payload: UnitOfMeasurePayload,
): Promise<UnitOfMeasureRow> {
  const { data } = await privateApi.put<UnitOfMeasureRow>(
    endpoints.unitsOfMeasure.update(id),
    payload,
    { successMessage: 'unitsOfMeasure.messages.updated' },
  );
  return data;
}

export async function deleteUnitOfMeasure(id: string): Promise<void> {
  await privateApi.delete(endpoints.unitsOfMeasure.remove(id), {
    successMessage: 'unitsOfMeasure.messages.deleted',
  });
}
