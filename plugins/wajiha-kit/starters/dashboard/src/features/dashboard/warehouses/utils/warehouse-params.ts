import type {
  WarehouseFlagFilter,
  WarehouseListFilters,
  WarehouseListParams,
} from '../types/types';

function toFlagParam(value: WarehouseFlagFilter): boolean | undefined {
  return value === '' ? undefined : value === 'true';
}

export function toWarehouseListParams(
  filters: WarehouseListFilters,
): WarehouseListParams {
  const q = filters.q.trim();
  return {
    q: q === '' ? undefined : q,
    isActive: toFlagParam(filters.isActive),
    isTransit: toFlagParam(filters.isTransit),
  };
}
