import type { SupplierRequest, SupplierResponse } from '@/types/api/suppliers';

export type SupplierRow = SupplierResponse;

export type SupplierPayload = SupplierRequest;

export type SupplierStatusFilter = 'all' | 'active' | 'inactive';

/** `registered`: the supplier master only. `all`: also names seen on documents. */
export type SupplierSourceFilter = 'registered' | 'all';

/** Params sent to the server; undefined keys are omitted from the query string. */
export interface SupplierListParams {
  q?: string;
  isActive?: boolean;
  includeUnregistered?: boolean;
  limit?: number;
}

/** What the delete confirm does: a supplier on documents can only be deactivated. */
export type SupplierDeleteMode = 'delete' | 'deactivate';
