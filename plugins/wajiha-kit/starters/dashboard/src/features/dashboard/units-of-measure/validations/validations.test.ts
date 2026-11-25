import { describe, expect, it } from 'vitest';
import { makeUnitOfMeasure } from '../uom-test-utils';
import {
  defaultUnitOfMeasureForm,
  toUnitOfMeasurePayload,
  toUnitOfMeasureValues,
  unitOfMeasureSchema,
  type UnitOfMeasureValues,
} from './validations';

const valid: UnitOfMeasureValues = {
  ...defaultUnitOfMeasureForm,
  code: 'PCS',
  name: 'Piece',
};

function firstMessage(values: unknown): string | undefined {
  return unitOfMeasureSchema.safeParse(values).error?.issues[0]?.message;
}

describe('unitOfMeasureSchema', () => {
  it('accepts the minimal valid form', () => {
    expect(unitOfMeasureSchema.safeParse(valid).success).toBe(true);
  });

  it('requires a code and a name with i18n-key messages', () => {
    const result = unitOfMeasureSchema.safeParse(defaultUnitOfMeasureForm);
    const messages = result.error?.issues.map((issue) => issue.message);
    expect(messages).toContain('unitsOfMeasure.form.errors.code');
    expect(messages).toContain('unitsOfMeasure.form.errors.name');
  });

  it('rejects a code longer than 20 characters', () => {
    expect(firstMessage({ ...valid, code: 'C'.repeat(21) })).toBe(
      'unitsOfMeasure.form.errors.codeLength',
    );
    expect(firstMessage({ ...valid, code: 'C'.repeat(20) })).toBeUndefined();
  });

  it('rejects a name longer than 100 characters', () => {
    expect(firstMessage({ ...valid, name: 'a'.repeat(101) })).toBe(
      'unitsOfMeasure.form.errors.nameLength',
    );
  });

  it('accepts decimal places 0 through 6 only', () => {
    for (const decimalPlaces of ['0', '1', '3', '5', '6']) {
      expect(
        unitOfMeasureSchema.safeParse({ ...valid, decimalPlaces }).success,
      ).toBe(true);
    }
    for (const decimalPlaces of ['7', '-1', '']) {
      expect(firstMessage({ ...valid, decimalPlaces })).toBe(
        'unitsOfMeasure.form.errors.decimalPlaces',
      );
    }
  });
});

describe('toUnitOfMeasurePayload', () => {
  it('uppercases the code, trims the name and maps decimal places to a number', () => {
    expect(
      toUnitOfMeasurePayload({
        code: ' kg ',
        name: ' Kilogram ',
        decimalPlaces: '3',
        isActive: false,
      }),
    ).toEqual({
      code: 'KG',
      name: 'Kilogram',
      decimalPlaces: 3,
      isActive: false,
    });
  });
});

describe('toUnitOfMeasureValues', () => {
  it('maps a row to form values', () => {
    expect(toUnitOfMeasureValues(makeUnitOfMeasure())).toEqual({
      code: 'KG',
      name: 'Kilogram',
      decimalPlaces: '3',
      isActive: true,
    });
  });

  it('maps null fields to safe defaults', () => {
    expect(
      toUnitOfMeasureValues(
        makeUnitOfMeasure({
          code: null,
          name: null,
          decimalPlaces: null,
          isActive: null,
        }),
      ),
    ).toEqual({ code: '', name: '', decimalPlaces: '0', isActive: true });
  });
});
