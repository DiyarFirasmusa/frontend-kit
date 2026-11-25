import { z } from 'zod';
import type {
  UnitOfMeasureRequest,
  UnitOfMeasureResponse,
} from '@/types/api/catalog';

export const unitOfMeasureSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, { message: 'unitsOfMeasure.form.errors.code' })
    .max(20, { message: 'unitsOfMeasure.form.errors.codeLength' }),
  name: z
    .string()
    .trim()
    .min(1, { message: 'unitsOfMeasure.form.errors.name' })
    .max(100, { message: 'unitsOfMeasure.form.errors.nameLength' }),
  decimalPlaces: z
    .string()
    .trim()
    .regex(/^[0-6]$/, { message: 'unitsOfMeasure.form.errors.decimalPlaces' }),
  isActive: z.boolean(),
});

export type UnitOfMeasureValues = z.infer<typeof unitOfMeasureSchema>;

export const defaultUnitOfMeasureForm: UnitOfMeasureValues = {
  code: '',
  name: '',
  decimalPlaces: '0',
  isActive: true,
};

export function toUnitOfMeasureValues(
  row: UnitOfMeasureResponse,
): UnitOfMeasureValues {
  return {
    code: row.code ?? '',
    name: row.name ?? '',
    decimalPlaces: String(row.decimalPlaces ?? 0),
    isActive: row.isActive ?? true,
  };
}

export function toUnitOfMeasurePayload(
  values: UnitOfMeasureValues,
): UnitOfMeasureRequest {
  return {
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    decimalPlaces: Number(values.decimalPlaces),
    isActive: values.isActive,
  };
}
