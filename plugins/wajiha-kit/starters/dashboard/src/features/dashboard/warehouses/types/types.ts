import type { PageResponse } from '@/types/api/page';
import type {
  WarehouseRequest,
  WarehouseResponse,
} from '@/types/api/warehouses';

export type WarehouseRow = WarehouseResponse;

/** The detail endpoint returns the same record as the list. */
export type WarehouseDetail = WarehouseResponse;

export type WarehousePayload = WarehouseRequest;

export const WAREHOUSE_STATUSES = ['all', 'active', 'inactive'] as const;
export type WarehouseStatusFilter = (typeof WAREHOUSE_STATUSES)[number];

export const WAREHOUSE_TYPES = ['all', 'regular', 'transit'] as const;
export type WarehouseTypeFilter = (typeof WAREHOUSE_TYPES)[number];

/** What the list request needs, in UI terms (1-based page, `name.asc` sort). */
export interface WarehouseListParams {
  page: number;
  pageSize: number;
  sort: string;
  q: string;
  status: WarehouseStatusFilter;
  type: WarehouseTypeFilter;
}

export type WarehouseListResponse = PageResponse<WarehouseRow>;
