import type { SupplierRow } from './types/types';

export function makeSupplier(
  overrides: Partial<SupplierRow> = {},
): SupplierRow {
  return {
    id: 'sup-1',
    code: 'SUP-001',
    name: 'Rafidain Supplies',
    contactName: 'Ali Hassan',
    phone: '+964 780 000 0000',
    email: 'orders@example.com',
    address: 'Baghdad',
    taxNumber: '123456789',
    notes: null,
    isActive: true,
    registered: true,
    inUse: false,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
    ...overrides,
  };
}
