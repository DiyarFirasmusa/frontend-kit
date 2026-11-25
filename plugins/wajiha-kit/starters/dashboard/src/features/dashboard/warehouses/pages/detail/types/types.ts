export type WarehouseDetailTab = 'overview' | 'members' | 'locations';

export const WAREHOUSE_DETAIL_TABS = [
  'overview',
  'members',
  'locations',
] as const satisfies readonly WarehouseDetailTab[];
