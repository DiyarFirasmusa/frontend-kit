// Shared by the browser form and the server function: the browser check is for the visitor's convenience,
// the server check is the one that counts. Messages are locale keys, translated where they are shown.
import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'contact.nameRequired' })
    .max(80, { message: 'contact.nameTooLong' }),
  email: z
    .string()
    .trim()
    .max(254, { message: 'contact.emailInvalid' })
    .pipe(z.email({ message: 'contact.emailInvalid' })),
  phone: z
    .string()
    .trim()
    .max(20, { message: 'contact.phoneInvalid' })
    .refine((value) => value === '' || /^\+?[0-9][0-9\s-]{5,18}$/.test(value), {
      message: 'contact.phoneInvalid',
    }),
  message: z
    .string()
    .trim()
    .min(10, { message: 'contact.messageTooShort' })
    .max(2000, { message: 'contact.messageTooLong' }),
  /** Honeypot: hidden from people, filled in by simple bots. Must stay empty. */
  website: z.string().max(200),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const EMPTY_CONTACT: ContactInput = {
  name: '',
  email: '',
  phone: '',
  message: '',
  website: '',
};
