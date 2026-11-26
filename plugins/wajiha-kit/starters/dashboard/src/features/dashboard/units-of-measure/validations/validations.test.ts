import { describe, expect, it } from 'vitest';
import { makeUnitOfMeasure } from '../uom-test-utils';
import {
  defaultUnitOfMeasureForm,
  toUnitOfMeasurePayload,
  toUnitOfMeasureValues,
  unitOfMeasureSchema,
} from './validations';

function issues(values: Partial<typeof defaultUnitOfMeasureForm>) {
  const result = unitOfMeasureSchema.safeParse({
    ...defaultUnitOfMeasureForm,
    ...values,
  });
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.message);
}

describe('unitOfMeasureSchema', () => {
  it('requires code and name', () => {
    expect(issues({})).toEqual([
      'unitsOfMeasure.validation.codeRequired',
      'unitsOfMeasure.validation.nameRequired',
    ]);
  });

  it('accepts a valid unit', () => {
    expect(issues({ code: 'PCS', name: 'Piece' })).toEqual([]);
  });

  it('enforces the backend lengths', () => {
    expect(issues({ code: 'x'.repeat(21), name: 'x'.repeat(101) })).toEqual([
      'unitsOfMeasure.validation.codeMax',
      'unitsOfMeasure.validation.nameMax',
    ]);
  });

  it('accepts decimal places 0 to 6 only', () => {
    for (const decimalPlaces of ['0', '3', '6']) {
      expect(issues({ code: 'A', name: 'B', decimalPlaces })).toEqual([]);
    }
    for (const decimalPlaces of ['7', '-1', '1.5', '', 'x']) {
      expect(issues({ code: 'A', name: 'B', decimalPlaces })).toEqual([
        'unitsOfMeasure.validation.decimalPlaces',
      ]);
    }
  });
});

describe('unit of measure form mappers', () => {
  it('round-trips a record through the form', () => {
    const values = toUnitOfMeasureValues(makeUnitOfMeasure());
    expect(values).toEqual({
      code: 'KG',
      name: 'Kilogram',
      decimalPlaces: '3',
      isActive: true,
    });
    expect(toUnitOfMeasurePayload(values)).toEqual({
      code: 'KG',
      name: 'Kilogram',
      decimalPlaces: 3,
      isActive: true,
    });
  });

  it('upper-cases the code and trims', () => {
    expect(
      toUnitOfMeasurePayload({
        code: ' pcs ',
        name: ' Piece ',
        decimalPlaces: '0',
        isActive: false,
      }),
    ).toEqual({
      code: 'PCS',
      name: 'Piece',
      decimalPlaces: 0,
      isActive: false,
    });
  });

  it('fills defaults for a record with nulls', () => {
    expect(
      toUnitOfMeasureValues(
        makeUnitOfMeasure({
          code: null,
          name: null,
          decimalPlaces: null,
          isActive: null,
        }),
      ),
    ).toEqual(defaultUnitOfMeasureForm);
  });
});
