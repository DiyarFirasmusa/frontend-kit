import { describe, expect, it } from 'vitest';
import { EMPTY_SUPPLIER, supplierSchema } from './validations';

function issues(values: Partial<typeof EMPTY_SUPPLIER>) {
  const result = supplierSchema.safeParse({ ...EMPTY_SUPPLIER, ...values });
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe('supplierSchema', () => {
  it('requires code and name', () => {
    expect(issues({})).toEqual(['suppliers.codeRequired', 'suppliers.nameRequired']);
  });

  it('accepts a supplier with only code and name', () => {
    expect(issues({ code: 'SUP-1', name: 'Northwind' })).toEqual([]);
  });

  it('enforces the API lengths', () => {
    expect(issues({ code: 'x'.repeat(31), name: 'x'.repeat(256), phone: '1'.repeat(51) })).toEqual([
      'suppliers.codeMax',
      'suppliers.nameMax',
      'suppliers.phoneMax',
    ]);
    expect(issues({ code: 'A', name: 'B', notes: 'x'.repeat(2001) })).toEqual([
      'suppliers.notesMax',
    ]);
  });

  it('checks the email only when one is typed', () => {
    expect(issues({ code: 'A', name: 'B', email: 'not-an-email' })).toEqual([
      'suppliers.emailInvalid',
    ]);
    expect(issues({ code: 'A', name: 'B', email: 'a@example.com' })).toEqual([]);
  });
});
