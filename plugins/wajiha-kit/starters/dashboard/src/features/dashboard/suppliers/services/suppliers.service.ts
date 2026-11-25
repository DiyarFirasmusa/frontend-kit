import { privateApi } from '@/api/client/private/private';
import { endpoints } from '@/constants/api';
import type {
  SupplierListParams,
  SupplierPayload,
  SupplierRow,
} from '../types/types';

/** The master list is one unpaged array; this caps it for the client-side pager. */
export const SUPPLIER_LIST_LIMIT = 500;

export async function fetchSuppliers(
  params: SupplierListParams,
): Promise<SupplierRow[]> {
  const { data } = await privateApi.get<SupplierRow[]>(
    endpoints.suppliers.list,
    {
      params: {
        q: params.q || undefined,
        isActive: params.isActive,
        includeUnregistered: params.includeUnregistered,
        limit: params.limit ?? SUPPLIER_LIST_LIMIT,
      },
    },
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
  successMessage = 'suppliers.messages.updated',
): Promise<SupplierRow> {
  const { data } = await privateApi.put<SupplierRow>(
    endpoints.suppliers.update(id),
    payload,
    { successMessage },
  );
  return data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await privateApi.delete(endpoints.suppliers.remove(id), {
    successMessage: 'suppliers.messages.deleted',
  });
}
