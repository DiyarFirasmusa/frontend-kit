import { describe, expect, it } from 'vitest';
import { defaultSupplierForm, supplierSchema } from './validations';

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
