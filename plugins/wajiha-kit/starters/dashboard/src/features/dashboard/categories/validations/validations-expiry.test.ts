import { describe, expect, it } from 'vitest';
import {
  categorySchema,
  defaultCategoryForm,
  toCategoryPayload,
  type CategoryFormValues,
} from './validations';

const valid: CategoryFormValues = {
  ...defaultCategoryForm,
  name: 'Medicines',
};

function messages(values: unknown): string[] {
  const result = categorySchema.safeParse(values);
  return (result.error?.issues ?? []).map((issue) => issue.message);
}

describe('categorySchema expiryAlertDays', () => {
  it('is optional', () => {
    expect(categorySchema.safeParse(valid).success).toBe(true);
  });

  it('accepts whole numbers from 1 to 365', () => {
    for (const days of [1, 45, 365]) {
      expect(
        categorySchema.safeParse({ ...valid, expiryAlertDays: days }).success,
      ).toBe(true);
    }
  });

  it('rejects zero, decimals and values over 365 with the i18n key', () => {
    for (const days of [0, -3, 1.5, 366]) {
      expect(messages({ ...valid, expiryAlertDays: days })).toContain(
        'categories.validation.expiryAlertDaysInvalid',
      );
    }
  });
});

describe('toCategoryPayload expiryAlertDays', () => {
  it('leaves an empty window out of the request', () => {
    const payload = toCategoryPayload(valid);
    expect('expiryAlertDays' in payload).toBe(false);
  });

  it('leaves it out when the category had no value of its own', () => {
    expect('expiryAlertDays' in toCategoryPayload(valid, null)).toBe(false);
    expect('expiryAlertDays' in toCategoryPayload(valid, 0)).toBe(false);
  });

  it('sends the entered window', () => {
    expect(
      toCategoryPayload({ ...valid, expiryAlertDays: 30 }, 60).expiryAlertDays,
    ).toBe(30);
  });

  it('sends 0 to clear a stored window', () => {
    expect(toCategoryPayload(valid, 60).expiryAlertDays).toBe(0);
  });
});
