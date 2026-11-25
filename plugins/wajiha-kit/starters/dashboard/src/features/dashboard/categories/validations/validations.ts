import { z } from 'zod';
import type {
  AttributeDefinitionRequest,
  ItemCategoryRequest,
} from '@/types/api/catalog';
import { AttributeDataTypeValues } from '@/types/api/enums';

export const categorySchema = z.object({
  code: z
    .string()
    .trim()
    .max(50, { message: 'categories.validation.codeTooLong' }),
  name: z
    .string()
    .trim()
    .min(1, { message: 'categories.validation.required' })
    .max(200, { message: 'categories.validation.nameTooLong' }),
  parentId: z.string(),
  isActive: z.boolean(),
  expiryAlertDays: z
    .number({ message: 'categories.validation.expiryAlertDaysInvalid' })
    .int({ message: 'categories.validation.expiryAlertDaysInvalid' })
    .min(1, { message: 'categories.validation.expiryAlertDaysInvalid' })
    .max(365, { message: 'categories.validation.expiryAlertDaysInvalid' })
    .optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const defaultCategoryForm: CategoryFormValues = {
  code: '',
  name: '',
  parentId: '',
  isActive: true,
  expiryAlertDays: undefined,
};

/**
 * An emptied expiry window is left out, so the category keeps inheriting; when
 * the category had its own value, `0` is sent to clear it.
 */
export function toCategoryPayload(
  values: CategoryFormValues,
  storedExpiryAlertDays?: number | null,
): ItemCategoryRequest {
  const hadExpiryAlertDays =
    typeof storedExpiryAlertDays === 'number' && storedExpiryAlertDays > 0;
  let expiryAlertDays: number | undefined = values.expiryAlertDays;
  if (expiryAlertDays === undefined && hadExpiryAlertDays) {
    expiryAlertDays = 0;
  }
  return {
    code: values.code.trim() || undefined,
    name: values.name.trim(),
    parentId: values.parentId || undefined,
    isActive: values.isActive,
    ...(expiryAlertDays === undefined ? {} : { expiryAlertDays }),
  };
}

export const attributeDefinitionSchema = z.object({
  code: z
    .string()
    .trim()
    .max(50, { message: 'categories.validation.codeTooLong' }),
  name: z
    .string()
    .trim()
    .min(1, { message: 'categories.validation.required' })
    .max(100, { message: 'categories.validation.attributeNameTooLong' }),
  dataType: z.enum(AttributeDataTypeValues, {
    message: 'categories.validation.dataTypeRequired',
  }),
  unitLabel: z
    .string()
    .trim()
    .max(20, { message: 'categories.validation.unitTooLong' }),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type AttributeDefinitionFormValues = z.infer<
  typeof attributeDefinitionSchema
>;

export const defaultAttributeDefinitionForm: AttributeDefinitionFormValues = {
  code: '',
  name: '',
  dataType: 'TEXT',
  unitLabel: '',
  status: 'ACTIVE',
};

export function toAttributeDefinitionPayload(
  values: AttributeDefinitionFormValues,
): AttributeDefinitionRequest {
  const unitLabel = values.unitLabel.trim();
  return {
    code: values.code.trim() || undefined,
    name: values.name.trim(),
    dataType: values.dataType,
    unitLabel: unitLabel === '' ? undefined : unitLabel,
    isActive: values.status === 'ACTIVE',
  };
}

export const attributeOptionSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, { message: 'categories.validation.required' })
    .max(100, { message: 'categories.validation.labelTooLong' }),
  sortOrder: z
    .number({ message: 'categories.validation.sortOrderInvalid' })
    .int({ message: 'categories.validation.sortOrderInvalid' })
    .min(0, { message: 'categories.validation.sortOrderInvalid' }),
  isActive: z.boolean(),
});

export type AttributeOptionFormValues = z.infer<typeof attributeOptionSchema>;

export const defaultAttributeOptionForm: AttributeOptionFormValues = {
  label: '',
  sortOrder: 0,
  isActive: true,
};

export const attachAttributeSchema = z.object({
  attributeDefinitionId: z
    .string()
    .min(1, { message: 'categories.validation.attributeRequired' }),
  isRequired: z.boolean(),
  isVariantAxis: z.boolean(),
});

export type AttachAttributeFormValues = z.infer<typeof attachAttributeSchema>;

export const defaultAttachAttributeForm: AttachAttributeFormValues = {
  attributeDefinitionId: '',
  isRequired: false,
  isVariantAxis: false,
};
