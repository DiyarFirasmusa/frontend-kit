import type { PageResponse } from '@/types/api/page';
import type { SupplierRequest, SupplierResponse } from '@/types/api/suppliers';

export type SupplierRow = SupplierResponse;

/** The detail endpoint returns the same record as the list today. */
export type SupplierDetail = SupplierResponse;

export type SupplierPayload = SupplierRequest;

export const SUPPLIER_STATUSES = ['all', 'active', 'inactive'] as const;
export type SupplierStatusFilter = (typeof SUPPLIER_STATUSES)[number];

/** What the list request needs, in UI terms (1-based page, `name.asc` sort). */
export interface SupplierListParams {
  page: number;
  pageSize: number;
  sort: string;
  q: string;
  status: SupplierStatusFilter;
}

export type SupplierListResponse = PageResponse<SupplierRow>;
