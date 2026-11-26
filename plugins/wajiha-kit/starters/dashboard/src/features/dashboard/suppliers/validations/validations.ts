import { z } from 'zod';
import type { SupplierDetail, SupplierPayload } from '../types/types';

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, { message });

export const supplierSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, { message: 'suppliers.validation.codeRequired' })
    .max(30, { message: 'suppliers.validation.codeMax' }),
  name: z
    .string()
    .trim()
    .min(1, { message: 'suppliers.validation.nameRequired' })
    .max(255, { message: 'suppliers.validation.nameMax' }),
  contactName: optionalText(150, 'suppliers.validation.contactNameMax'),
  phone: optionalText(50, 'suppliers.validation.phoneMax'),
  email: z
    .string()
    .trim()
    .max(150, { message: 'suppliers.validation.emailMax' })
    .refine((value) => value === '' || z.email().safeParse(value).success, {
      message: 'suppliers.validation.email',
    }),
  address: optionalText(500, 'suppliers.validation.addressMax'),
  taxNumber: optionalText(50, 'suppliers.validation.taxNumberMax'),
  notes: optionalText(2000, 'suppliers.validation.notesMax'),
  isActive: z.boolean(),
});

export type SupplierValues = z.infer<typeof supplierSchema>;

/** The fields of the form, for mapping backend field errors onto inputs. */
export const SUPPLIER_FORM_FIELDS = supplierSchema.keyof().options;

export const defaultSupplierForm: SupplierValues = {
  code: '',
  name: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
  taxNumber: '',
  notes: '',
  isActive: true,
};

export function toSupplierFormValues(detail: SupplierDetail): SupplierValues {
  return {
    code: detail.code ?? '',
    name: detail.name ?? '',
    contactName: detail.contactName ?? '',
    phone: detail.phone ?? '',
    email: detail.email ?? '',
    address: detail.address ?? '',
    taxNumber: detail.taxNumber ?? '',
    notes: detail.notes ?? '',
    isActive: detail.isActive ?? true,
  };
}

/** Empty optional fields are left out, as the OpenAPI request marks them optional. */
export function toSupplierPayload(values: SupplierValues): SupplierPayload {
  const payload: SupplierPayload = {
    code: values.code.trim(),
    name: values.name.trim(),
    isActive: values.isActive,
  };
  const optional = {
    contactName: values.contactName.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    address: values.address.trim(),
    taxNumber: values.taxNumber.trim(),
    notes: values.notes.trim(),
  };
  for (const [key, value] of Object.entries(optional)) {
    if (value !== '') {
      Object.assign(payload, { [key]: value });
    }
  }
  return payload;
}
