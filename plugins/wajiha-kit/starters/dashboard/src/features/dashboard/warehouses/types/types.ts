export type WarehouseFlagFilter = '' | 'true' | 'false';

export interface WarehouseListFilters {
  q: string;
  isActive: WarehouseFlagFilter;
  isTransit: WarehouseFlagFilter;
}

export interface WarehouseListParams {
  q?: string;
  isActive?: boolean;
  isTransit?: boolean;
}
