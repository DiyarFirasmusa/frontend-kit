import { z } from 'zod';

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
