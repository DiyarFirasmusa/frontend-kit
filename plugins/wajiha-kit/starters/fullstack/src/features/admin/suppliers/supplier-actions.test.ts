import type { TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';
import type { Supplier } from '../types/api';
import { getSupplierRowActions, toSupplierFormValues, toSupplierPayload } from './supplier-actions';
import { EMPTY_SUPPLIER } from './validations';

const t = ((key: string) => key) as unknown as TFunction;

function makeSupplier(overrides: Partial<Supplier> = {}): Supplier {
  return {
    id: 'sup-001',
    code: 'SUP-001',
    name: 'Northwind Supplies',
    contactName: 'Omar Karim',
    phone: '+000 000 0001',
    email: 'supplier01@example.com',
    notes: null,
    isActive: true,
    updatedAt: '2026-01-15T09:00:00.000Z',
    ...overrides,
  };
}

function actionIds(canWrite: boolean, canDelete: boolean): string[] {
  return getSupplierRowActions({
    t,
    row: makeSupplier(),
    canWrite,
    canDelete,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }).map((action) => action.id);
}

describe('supplier row actions', () => {
  it('offers edit and delete by permission', () => {
    expect(actionIds(true, true)).toEqual(['edit', 'delete']);
    expect(actionIds(true, false)).toEqual(['edit']);
    expect(actionIds(false, true)).toEqual(['delete']);
    expect(actionIds(false, false)).toEqual([]);
  });

  it('hands the row to the handler', () => {
    const onDelete = vi.fn();
    const row = makeSupplier();
    const [, remove] = getSupplierRowActions({
      t,
      row,
      canWrite: true,
      canDelete: true,
      onEdit: vi.fn(),
      onDelete,
    });
    remove?.onSelect();
    expect(onDelete).toHaveBeenCalledWith(row);
  });
});

describe('supplier form mapping', () => {
  it('turns missing values into empty fields', () => {
    expect(toSupplierFormValues(makeSupplier({ contactName: null, email: null }))).toEqual({
      ...EMPTY_SUPPLIER,
      code: 'SUP-001',
      name: 'Northwind Supplies',
      phone: '+000 000 0001',
    });
  });

  it('sends trimmed values and leaves empty optional fields out', () => {
    expect(
      toSupplierPayload({
        ...EMPTY_SUPPLIER,
        code: ' SUP-9 ',
        name: ' Cedar ',
        email: ' a@example.com ',
        isActive: false,
      }),
    ).toEqual({ code: 'SUP-9', name: 'Cedar', email: 'a@example.com', isActive: false });
  });
});
