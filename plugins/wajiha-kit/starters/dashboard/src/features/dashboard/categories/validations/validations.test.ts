import { describe, expect, it } from 'vitest';
import {
  attachAttributeSchema,
  attributeDefinitionSchema,
  attributeOptionSchema,
  categorySchema,
  defaultAttachAttributeForm,
  defaultAttributeDefinitionForm,
  defaultAttributeOptionForm,
  defaultCategoryForm,
  toAttributeDefinitionPayload,
  toCategoryPayload,
  type AttributeDefinitionFormValues,
  type AttributeOptionFormValues,
  type CategoryFormValues,
} from './validations';

type Parser = {
  safeParse: (v: unknown) => { error?: { issues: { message: string }[] } };
};

function firstMessage(schema: Parser, values: unknown): string | undefined {
  return schema.safeParse(values).error?.issues[0]?.message;
}

const validCategory: CategoryFormValues = {
  ...defaultCategoryForm,
  code: 'SAFETY',
  name: 'Safety',
};

describe('categorySchema', () => {
  it('accepts a valid category', () => {
    expect(categorySchema.safeParse(validCategory).success).toBe(true);
  });

  it('requires the name with the required key; the code is optional', () => {
    expect(firstMessage(categorySchema, defaultCategoryForm)).toBe(
      'categories.validation.required',
    );
    expect(
      firstMessage(categorySchema, { ...validCategory, name: '   ' }),
    ).toBe('categories.validation.required');
  });

  it('enforces max lengths on code and name', () => {
    expect(
      firstMessage(categorySchema, { ...validCategory, code: 'a'.repeat(51) }),
    ).toBe('categories.validation.codeTooLong');
    expect(
      firstMessage(categorySchema, { ...validCategory, code: 'a'.repeat(50) }),
    ).toBeUndefined();
    expect(
      firstMessage(categorySchema, { ...validCategory, name: 'a'.repeat(201) }),
    ).toBe('categories.validation.nameTooLong');
    expect(
      firstMessage(categorySchema, { ...validCategory, name: 'a'.repeat(200) }),
    ).toBeUndefined();
  });

  it('maps an empty parentId to undefined in the payload', () => {
    expect(toCategoryPayload(validCategory)).toEqual({
      code: 'SAFETY',
      name: 'Safety',
      parentId: undefined,
      isActive: true,
    });
    expect(
      toCategoryPayload({ ...validCategory, parentId: 'cat-1' }).parentId,
    ).toBe('cat-1');
  });
});

const validAttribute: AttributeDefinitionFormValues = {
  ...defaultAttributeDefinitionForm,
  code: 'COLOR',
  name: 'Color',
};

describe('attribute status', () => {
  it('maps the status select to isActive in the payload', () => {
    expect(toAttributeDefinitionPayload(validAttribute).isActive).toBe(true);
    expect(
      toAttributeDefinitionPayload({ ...validAttribute, status: 'INACTIVE' })
        .isActive,
    ).toBe(false);
  });
});

describe('attributeDefinitionSchema', () => {
  it('accepts a valid definition and rejects a missing name', () => {
    expect(attributeDefinitionSchema.safeParse(validAttribute).success).toBe(
      true,
    );
    expect(
      attributeDefinitionSchema.safeParse({ ...validAttribute, code: '' })
        .success,
    ).toBe(true);
    expect(
      firstMessage(attributeDefinitionSchema, { ...validAttribute, name: '' }),
    ).toBe('categories.validation.required');
  });

  it('enforces name, code and unit max lengths', () => {
    expect(
      firstMessage(attributeDefinitionSchema, {
        ...validAttribute,
        name: 'a'.repeat(101),
      }),
    ).toBe('categories.validation.attributeNameTooLong');
    expect(
      firstMessage(attributeDefinitionSchema, {
        ...validAttribute,
        code: 'a'.repeat(51),
      }),
    ).toBe('categories.validation.codeTooLong');
    expect(
      firstMessage(attributeDefinitionSchema, {
        ...validAttribute,
        unitLabel: 'a'.repeat(21),
      }),
    ).toBe('categories.validation.unitTooLong');
  });

  it('rejects an unknown dataType with the dataTypeRequired key', () => {
    expect(
      firstMessage(attributeDefinitionSchema, {
        ...validAttribute,
        dataType: 'JSON',
      }),
    ).toBe('categories.validation.dataTypeRequired');
    expect(
      attributeDefinitionSchema.safeParse({
        ...validAttribute,
        dataType: 'OPTION',
      }).success,
    ).toBe(true);
  });

  it('maps an empty unitLabel to undefined in the payload', () => {
    expect(
      toAttributeDefinitionPayload(validAttribute).unitLabel,
    ).toBeUndefined();
    expect(
      toAttributeDefinitionPayload({ ...validAttribute, unitLabel: ' kg ' })
        .unitLabel,
    ).toBe('kg');
  });
});

const validOption: AttributeOptionFormValues = {
  ...defaultAttributeOptionForm,
  label: 'Black',
};

describe('attributeOptionSchema', () => {
  it('accepts a valid option', () => {
    expect(attributeOptionSchema.safeParse(validOption).success).toBe(true);
  });

  it('requires the label and enforces its max length', () => {
    expect(
      firstMessage(attributeOptionSchema, { ...validOption, label: '' }),
    ).toBe('categories.validation.required');
    expect(
      firstMessage(attributeOptionSchema, {
        ...validOption,
        label: 'a'.repeat(101),
      }),
    ).toBe('categories.validation.labelTooLong');
  });

  it('requires sortOrder to be a whole number of at least 0', () => {
    const invalid = 'categories.validation.sortOrderInvalid';
    const at = (sortOrder: unknown) =>
      firstMessage(attributeOptionSchema, { ...validOption, sortOrder });
    const cleared = { label: 'Black', isActive: true };
    expect(at(-1)).toBe(invalid);
    expect(at(1.5)).toBe(invalid);
    expect(at(NaN)).toBe(invalid);
    expect(firstMessage(attributeOptionSchema, cleared)).toBe(invalid);
    expect(at(0)).toBeUndefined();
  });
});

describe('attachAttributeSchema', () => {
  it('requires an attribute id', () => {
    expect(
      firstMessage(attachAttributeSchema, defaultAttachAttributeForm),
    ).toBe('categories.validation.attributeRequired');
    expect(
      attachAttributeSchema.safeParse({
        ...defaultAttachAttributeForm,
        attributeDefinitionId: 'attr-1',
      }).success,
    ).toBe(true);
  });
});
