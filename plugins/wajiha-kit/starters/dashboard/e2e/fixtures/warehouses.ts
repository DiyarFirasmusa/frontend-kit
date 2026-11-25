import type { Page } from '@playwright/test';
import type {
  LocationResponse,
  WarehouseResponse,
  WarehouseUserResponse,
} from '@/types/api/warehouses';
import type { MockApi } from './app';

export const WAREHOUSES: WarehouseResponse[] = [
  {
    id: 'wh-1',
    name: 'Baghdad central warehouse',
    code: 'BGD-01',
    address: 'Baghdad, industrial zone',
    hrOrgUnitId: null,
    managerEmployeeId: null,
    managerUserId: '6f1d2c3a-0000-4000-8000-000000000001',
    isTransit: false,
    isActive: true,
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
    locationCount: 3,
    memberCount: 1,
    managerName: null,
  },
  {
    id: 'wh-2',
    name: 'Transit depot',
    code: 'TRN-01',
    address: 'Basra, port road',
    hrOrgUnitId: null,
    managerEmployeeId: null,
    managerUserId: null,
    isTransit: true,
    isActive: true,
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-01-20T09:00:00Z',
    locationCount: null,
    memberCount: null,
    managerName: null,
  },
];

export const MEMBERS: WarehouseUserResponse[] = [
  {
    id: 'm-1',
    warehouseId: 'wh-1',
    userId: '6f1d2c3a-0000-4000-8000-000000000002',
    createdAt: '2026-02-01T09:00:00Z',
    role: 'STOREKEEPER',
    userName: 'سارة علي',
    isManager: false,
    isActive: true,
  },
];

export const LOCATIONS: LocationResponse[] = [
  {
    id: 'loc-1',
    warehouseId: 'wh-1',
    parentId: null,
    locationTypeId: 'lt-1',
    code: 'ZONE-R',
    name: 'Receiving zone',
    barcode: null,
    isBlocked: false,
    isActive: true,
    parentCode: null,
    locationTypeName: null,
    childCount: 0,
  },
  {
    id: 'loc-2',
    warehouseId: 'wh-1',
    parentId: 'loc-1',
    locationTypeId: 'lt-2',
    code: 'R-01',
    name: 'Receiving bay 1',
    barcode: null,
    isBlocked: false,
    isActive: true,
    parentCode: null,
    locationTypeName: null,
    childCount: 0,
  },
  {
    id: 'loc-3',
    warehouseId: 'wh-1',
    parentId: null,
    locationTypeId: 'lt-1',
    code: 'ZONE-A',
    name: 'Storage hall A',
    barcode: null,
    isBlocked: false,
    isActive: true,
    parentCode: null,
    locationTypeName: null,
    childCount: 0,
  },
];

/** List, detail, members and locations stubs for the warehouses feature. */
export async function mockWarehouses(mockApi: MockApi): Promise<void> {
  await mockApi.json('**/api/warehouses', WAREHOUSES);
  await mockApi.json('**/api/warehouses?*', WAREHOUSES);
  await mockApi.json('**/api/warehouses/wh-1', WAREHOUSES[0]);
  await mockApi.json('**/api/warehouses/wh-1/users', MEMBERS);
  await mockApi.json('**/api/warehouses/wh-1/locations', LOCATIONS);
}

function matchesFlag(value: boolean | null, param: string | null): boolean {
  return param === null || String(value ?? false) === param;
}

/** Applies the list's `q`, `isActive` and `isTransit` params like the server. */
export async function mockWarehouseListFilters(page: Page): Promise<void> {
  await page.route('**/api/warehouses?*', (route) => {
    const params = new URL(route.request().url()).searchParams;
    const q = params.get('q')?.toLowerCase() ?? '';
    const rows = WAREHOUSES.filter(
      (row) =>
        [row.name, row.code].some((value) =>
          (value ?? '').toLowerCase().includes(q),
        ) &&
        matchesFlag(row.isActive, params.get('isActive')) &&
        matchesFlag(row.isTransit, params.get('isTransit')),
    );
    return route.fulfill({ status: 200, json: rows });
  });
}
