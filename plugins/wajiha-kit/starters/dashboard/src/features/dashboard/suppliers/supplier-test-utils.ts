import type { SupplierListResponse, SupplierRow } from './types/types';

export function makeSupplier(
  overrides: Partial<SupplierRow> = {},
): SupplierRow {
  return {
    id: 'sup-1',
    code: 'SUP-001',
    name: 'Demo Supplies',
    contactName: 'Sam Lee',
    phone: '+964 780 000 0000',
    email: 'orders@example.com',
    address: 'Main street',
    taxNumber: '123456789',
    notes: null,
    isActive: true,
    inUse: false,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
    ...overrides,
  };
}

/** One page in the backend's shape. */
export function makeSupplierPage(
  rows: SupplierRow[],
  total = rows.length,
): SupplierListResponse {
  return {
    content: rows,
    totalElements: total,
    totalPages: Math.ceil(total / 10),
    number: 0,
    size: 10,
  };
}
