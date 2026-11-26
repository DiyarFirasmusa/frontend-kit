import { describe, expect, it } from 'vitest';
import {
  ATTRIBUTE_FORM_FIELDS,
  CATEGORY_FORM_FIELDS,
  defaultAttributeDefinitionForm,
  defaultCategoryForm,
  toAttributeFormValues,
  toCategoryFormValues,
} from './validations';

describe('toCategoryFormValues', () => {
  it('fills the form from the record loaded by id', () => {
    expect(
      toCategoryFormValues({
        id: 'cat-1',
        parentId: 'cat-0',
        code: 'HAND',
        name: 'Hand protection',
        isActive: false,
        itemCount: 3,
        childCount: 0,
        expiryAlertDays: 30,
      }),
    ).toEqual({
      code: 'HAND',
      name: 'Hand protection',
      parentId: 'cat-0',
      isActive: false,
      expiryAlertDays: 30,
    });
  });

  it('turns nulls into the form defaults and no expiry window', () => {
    expect(
      toCategoryFormValues({
        id: 'cat-1',
        parentId: null,
        code: null,
        name: null,
        isActive: null,
        itemCount: null,
        childCount: null,
        expiryAlertDays: 0,
      }),
    ).toEqual(defaultCategoryForm);
  });

  it('lists every form field for backend error mapping', () => {
    expect(CATEGORY_FORM_FIELDS).toEqual(Object.keys(defaultCategoryForm));
  });
});

describe('toAttributeFormValues', () => {
  it('keeps the unit only for a NUMBER attribute', () => {
    const base = {
      id: 'attr-1',
      code: 'W',
      name: 'Weight',
      unitLabel: 'kg',
      isActive: true,
      options: [],
    };
    expect(toAttributeFormValues({ ...base, dataType: 'NUMBER' })).toEqual({
      code: 'W',
      name: 'Weight',
      dataType: 'NUMBER',
      unitLabel: 'kg',
      status: 'ACTIVE',
    });
    expect(toAttributeFormValues({ ...base, dataType: 'TEXT' }).unitLabel).toBe(
      '',
    );
  });

  it('maps an inactive record and nulls', () => {
    expect(
      toAttributeFormValues({
        id: 'attr-1',
        code: null,
        name: null,
        dataType: null,
        unitLabel: null,
        isActive: false,
        options: null,
      }),
    ).toEqual({ ...defaultAttributeDefinitionForm, status: 'INACTIVE' });
  });

  it('lists every form field for backend error mapping', () => {
    expect(ATTRIBUTE_FORM_FIELDS).toEqual(
      Object.keys(defaultAttributeDefinitionForm),
    );
  });
});
