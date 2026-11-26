import { describe, expect, it } from 'vitest';
import { makeSupplier } from '../supplier-test-utils';
import {
  defaultSupplierForm,
  supplierSchema,
  toSupplierFormValues,
  toSupplierPayload,
} from './validations';

function issues(values: Partial<typeof defaultSupplierForm>) {
  const result = supplierSchema.safeParse({
    ...defaultSupplierForm,
    ...values,
  });
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.message);
}

describe('supplierSchema', () => {
  it('requires code and name', () => {
    expect(issues({})).toEqual([
      'suppliers.validation.codeRequired',
      'suppliers.validation.nameRequired',
    ]);
  });

  it('accepts a supplier with only code and name', () => {
    expect(issues({ code: 'SUP-1', name: 'Acme' })).toEqual([]);
  });

  it('enforces the backend lengths', () => {
    expect(
      issues({
        code: 'x'.repeat(31),
        name: 'x'.repeat(256),
        phone: '1'.repeat(51),
      }),
    ).toEqual([
      'suppliers.validation.codeMax',
      'suppliers.validation.nameMax',
      'suppliers.validation.phoneMax',
    ]);
    expect(issues({ code: 'A', name: 'B', notes: 'x'.repeat(2001) })).toEqual([
      'suppliers.validation.notesMax',
    ]);
  });

  it('checks the email only when one is typed', () => {
    expect(issues({ code: 'A', name: 'B', email: 'not-an-email' })).toEqual([
      'suppliers.validation.email',
    ]);
    expect(issues({ code: 'A', name: 'B', email: 'a@b.co' })).toEqual([]);
  });
});

describe('supplier form mappers', () => {
  it('round-trips a record through the form', () => {
    const values = toSupplierFormValues(
      makeSupplier({ notes: null, contactName: '' }),
    );
    expect(values.notes).toBe('');
    expect(toSupplierPayload(values)).toEqual({
      code: 'SUP-001',
      name: 'Demo Supplies',
      phone: '+964 780 000 0000',
      email: 'orders@example.com',
      address: 'Main street',
      taxNumber: '123456789',
      isActive: true,
    });
  });

  it('trims and leaves empty optional fields out of the payload', () => {
    expect(
      toSupplierPayload({
        ...defaultSupplierForm,
        code: ' SUP-9 ',
        name: ' Nine ',
        notes: '  ',
      }),
    ).toEqual({ code: 'SUP-9', name: 'Nine', isActive: true });
  });
});
