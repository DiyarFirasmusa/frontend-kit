import { describe, expect, it, vi } from 'vitest';
import { makeSupplier } from '../supplier-test-utils';
import { defaultSupplierForm } from '../validations/validations';
import {
  canRemoveSupplier,
  getSupplierDeleteMode,
  getSupplierRowActions,
  toRegisterFormValues,
  toSupplierFormValues,
  toSupplierPayload,
} from './supplier-actions';

const t = (key: string) => key;

function actionIds(
  row = makeSupplier(),
  canWrite = true,
  canDelete = true,
): string[] {
  return getSupplierRowActions({
    t: t as never,
    row,
    canWrite,
    canDelete,
    onEdit: vi.fn(),
    onRegister: vi.fn(),
    onRemove: vi.fn(),
  }).map((action) => action.id);
}

describe('supplier actions', () => {
  it('offers edit and delete for an unused supplier', () => {
    expect(actionIds()).toEqual(['edit', 'delete']);
    expect(actionIds(makeSupplier(), false, true)).toEqual(['delete']);
    expect(actionIds(makeSupplier(), true, false)).toEqual(['edit']);
  });

  it('turns delete into deactivate for a supplier on documents', () => {
    const used = makeSupplier({ inUse: true });
    expect(getSupplierDeleteMode(used)).toBe('deactivate');
    expect(actionIds(used)).toEqual(['edit', 'deactivate']);
    expect(canRemoveSupplier(used, false, true)).toBe(false);
    expect(actionIds(makeSupplier({ inUse: true, isActive: false }))).toEqual([
      'edit',
    ]);
  });

  it('offers only register for a name seen on documents', () => {
    const loose = makeSupplier({ registered: false });
    expect(actionIds(loose)).toEqual(['register']);
    expect(actionIds(loose, false, true)).toEqual([]);
    expect(toRegisterFormValues(loose)).toEqual({
      ...defaultSupplierForm,
      code: 'SUP-001',
      name: 'Rafidain Supplies',
    });
  });

  it('maps a row to form values and back to a trimmed payload', () => {
    const values = toSupplierFormValues(makeSupplier({ notes: null }));
    expect(values.notes).toBe('');
    expect(
      toSupplierPayload({ ...values, phone: '  ', name: ' Rafidain ' }),
    ).toEqual({
      code: 'SUP-001',
      name: 'Rafidain',
      isActive: true,
      contactName: 'Ali Hassan',
      email: 'orders@example.com',
      address: 'Baghdad',
      taxNumber: '123456789',
    });
  });
});
