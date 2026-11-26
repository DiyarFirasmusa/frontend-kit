import { privateApi } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { Page, Supplier, SupplierListParams, SupplierRequest } from '../types/api';

export async function fetchSuppliers(params: SupplierListParams): Promise<Page<Supplier>> {
  const { data } = await privateApi.get<Page<Supplier>>(endpoints.suppliers.list, {
    params: {
      q: params.q === undefined || params.q === '' ? undefined : params.q,
      status: params.status,
      page: params.page,
      pageSize: params.pageSize,
    },
  });
  return data;
}

export async function createSupplier(payload: SupplierRequest): Promise<Supplier> {
  const { data } = await privateApi.post<Supplier>(endpoints.suppliers.create, payload, {
    successMessage: 'suppliers.created',
  });
  return data;
}

export async function updateSupplier(id: string, payload: SupplierRequest): Promise<Supplier> {
  const { data } = await privateApi.put<Supplier>(
    endpoints.suppliers.update(encodeURIComponent(id)),
    payload,
    { successMessage: 'suppliers.updated' },
  );
  return data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await privateApi.delete(endpoints.suppliers.remove(encodeURIComponent(id)), {
    successMessage: 'suppliers.deleted',
  });
}
