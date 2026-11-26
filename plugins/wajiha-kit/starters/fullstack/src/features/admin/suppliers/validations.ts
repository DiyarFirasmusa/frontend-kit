import { z } from '@/shared/lib/zod';

const optionalText = (max: number, message: string) => z.string().trim().max(max, { message });

/** The supplier form. Limits match the API; messages are i18n keys. */
export const supplierSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, { message: 'suppliers.codeRequired' })
    .max(30, { message: 'suppliers.codeMax' }),
  name: z
    .string()
    .trim()
    .min(1, { message: 'suppliers.nameRequired' })
    .max(255, { message: 'suppliers.nameMax' }),
  contactName: optionalText(150, 'suppliers.contactNameMax'),
  phone: optionalText(50, 'suppliers.phoneMax'),
  email: z
    .string()
    .trim()
    .max(150, { message: 'suppliers.emailMax' })
    .refine((value) => value === '' || z.email().safeParse(value).success, {
      message: 'suppliers.emailInvalid',
    }),
  notes: optionalText(2000, 'suppliers.notesMax'),
  isActive: z.boolean(),
});

export type SupplierValues = z.infer<typeof supplierSchema>;

export const EMPTY_SUPPLIER: SupplierValues = {
  code: '',
  name: '',
  contactName: '',
  phone: '',
  email: '',
  notes: '',
  isActive: true,
};

/** The inputs of the supplier form: the names a backend field error can be shown under. */
export const SUPPLIER_FIELDS: readonly (keyof SupplierValues)[] = [
  'code',
  'name',
  'contactName',
  'phone',
  'email',
  'notes',
  'isActive',
];
