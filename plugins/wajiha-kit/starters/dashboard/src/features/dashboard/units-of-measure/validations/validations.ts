import { z } from 'zod';
import type { UnitOfMeasureDetail, UnitOfMeasurePayload } from '../types/types';

export const unitOfMeasureSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, { message: 'unitsOfMeasure.validation.codeRequired' })
    .max(20, { message: 'unitsOfMeasure.validation.codeMax' }),
  name: z
    .string()
    .trim()
    .min(1, { message: 'unitsOfMeasure.validation.nameRequired' })
    .max(100, { message: 'unitsOfMeasure.validation.nameMax' }),
  decimalPlaces: z
    .string()
    .trim()
    .regex(/^[0-6]$/, { message: 'unitsOfMeasure.validation.decimalPlaces' }),
  isActive: z.boolean(),
});

export type UnitOfMeasureValues = z.infer<typeof unitOfMeasureSchema>;

/** The fields of the form, for mapping backend field errors onto inputs. */
export const UOM_FORM_FIELDS = unitOfMeasureSchema.keyof().options;

export const defaultUnitOfMeasureForm: UnitOfMeasureValues = {
  code: '',
  name: '',
  decimalPlaces: '0',
  isActive: true,
};

export function toUnitOfMeasureValues(
  detail: UnitOfMeasureDetail,
): UnitOfMeasureValues {
  return {
    code: detail.code ?? '',
    name: detail.name ?? '',
    decimalPlaces: String(detail.decimalPlaces ?? 0),
    isActive: detail.isActive ?? true,
  };
}

export function toUnitOfMeasurePayload(
  values: UnitOfMeasureValues,
): UnitOfMeasurePayload {
  return {
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    decimalPlaces: Number(values.decimalPlaces),
    isActive: values.isActive,
  };
}
