import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type {
  UnitOfMeasureListParams,
  UnitOfMeasurePayload,
  UnitOfMeasureRow,
} from '../types/types';

export async function fetchUnitsOfMeasure(
  params: UnitOfMeasureListParams,
): Promise<UnitOfMeasureRow[]> {
  const { data } = await privateApi.get<UnitOfMeasureRow[]>(
    endpoints.unitsOfMeasure.list,
    { params },
  );
  return data;
}

export async function createUnitOfMeasure(
  payload: UnitOfMeasurePayload,
): Promise<UnitOfMeasureRow> {
  const { data } = await privateApi.post<UnitOfMeasureRow>(
    endpoints.unitsOfMeasure.create,
    payload,
    { successMessage: 'unitsOfMeasure.toasts.created' },
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
    { successMessage: 'unitsOfMeasure.toasts.updated' },
  );
  return data;
}

export async function deleteUnitOfMeasure(id: string): Promise<void> {
  await privateApi.delete(endpoints.unitsOfMeasure.remove(id), {
    successMessage: 'unitsOfMeasure.toasts.deleted',
  });
}
