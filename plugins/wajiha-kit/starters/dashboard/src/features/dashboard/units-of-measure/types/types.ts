import type {
  UnitOfMeasureRequest,
  UnitOfMeasureResponse,
} from '@/types/api/catalog';
import type { PageResponse } from '@/types/api/page';

export type UnitOfMeasureRow = UnitOfMeasureResponse;

/** The detail endpoint returns the same record as the list. */
export type UnitOfMeasureDetail = UnitOfMeasureResponse;

export type UnitOfMeasurePayload = UnitOfMeasureRequest;

export const UOM_STATUSES = ['all', 'active', 'inactive'] as const;
export type UomStatusFilter = (typeof UOM_STATUSES)[number];

/** The decimals filter: every place the backend allows, or no filter. */
export const UOM_DECIMALS = ['all', '0', '1', '2', '3', '4', '5', '6'] as const;
export type UomDecimalsFilter = (typeof UOM_DECIMALS)[number];

/** What the list request needs, in UI terms (1-based page, `name.asc` sort). */
export interface UnitOfMeasureListParams {
  page: number;
  pageSize: number;
  sort: string;
  q: string;
  status: UomStatusFilter;
  decimals: UomDecimalsFilter;
}

export type UnitOfMeasureListResponse = PageResponse<UnitOfMeasureRow>;
