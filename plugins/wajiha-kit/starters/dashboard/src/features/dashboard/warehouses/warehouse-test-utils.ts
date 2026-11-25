import type {
  LocationResponse,
  WarehouseResponse,
  WarehouseUserResponse,
} from '@/types/api/warehouses';

export function makeWarehouse(
  overrides: Partial<WarehouseResponse> = {},
): WarehouseResponse {
  return {
    id: 'wh-1',
    code: 'BGD-01',
    name: 'Baghdad central warehouse',
    address: 'Baghdad, industrial zone',
    hrOrgUnitId: null,
    managerEmployeeId: null,
    managerUserId: '6f1d2c3a-0000-4000-8000-000000000001',
    isTransit: false,
    isActive: true,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
    locationCount: null,
    memberCount: null,
    managerName: null,
    ...overrides,
  };
}

export function makeWarehouseMember(
  overrides: Partial<WarehouseUserResponse> = {},
): WarehouseUserResponse {
  return {
    id: 'm-1',
    warehouseId: 'wh-1',
    userId: '6f1d2c3a-0000-4000-8000-000000000002',
    createdAt: '2026-02-01T09:00:00Z',
    role: 'STOREKEEPER',
    isManager: false,
    isActive: true,
    userName: 'Sara Ali',
    ...overrides,
  };
}

export function makeLocation(
  overrides: Partial<LocationResponse> = {},
): LocationResponse {
  return {
    id: 'loc-1',
    warehouseId: 'wh-1',
    parentId: null,
    parentCode: null,
    locationTypeId: 'lt-1',
    locationTypeName: 'Zone',
    code: 'ZONE-A',
    name: 'Storage hall A',
    barcode: null,
    isBlocked: false,
    isActive: true,
    childCount: 0,
    ...overrides,
  };
}
