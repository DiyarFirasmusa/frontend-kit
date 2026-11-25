import type {
  UnitOfMeasureRequest,
  UnitOfMeasureResponse,
} from '@/types/api/catalog';

export type UnitOfMeasureRow = UnitOfMeasureResponse;

export type UnitOfMeasurePayload = UnitOfMeasureRequest;

export interface UnitOfMeasureListParams {
  q?: string;
  isActive?: boolean;
  decimalPlaces?: number;
}
