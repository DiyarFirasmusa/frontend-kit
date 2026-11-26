// Shared by the browser form and the server function: the browser check is for the visitor's convenience,
// the server check is the one that counts. Messages are locale keys, translated where they are shown.
import { z } from '@/shared/lib/zod';

/** Arabic-Indic (٠-٩) and Eastern Arabic / Persian (۰-۹) digits to 0-9, so phone keyboards in Arabic work. */
export function toAsciiDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

/** Digits with spaces, hyphens, dots or brackets between them, optionally starting with +. */
function isPhone(value: string): boolean {
  if (!/^\+?[0-9\s().-]+$/.test(value)) {
    return false;
  }
  const digits = value.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 15;
}

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
    .transform(toAsciiDigits)
    .refine((value) => value === '' || isPhone(value), { message: 'contact.phoneInvalid' }),
  message: z
    .string()
    .trim()
    .min(10, { message: 'contact.messageTooShort' })
    .max(2000, { message: 'contact.messageTooLong' }),
  /**
   * Honeypot: hidden from people, filled in by simple bots. Must stay empty. The name means nothing to
   * browsers and password managers on purpose: a field called "website" or "url" gets autofilled, and the
   * real visitor's message would then be dropped as spam.
   */
  contactRef: z.string().max(200),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const EMPTY_CONTACT: ContactInput = {
  name: '',
  email: '',
  phone: '',
  message: '',
  contactRef: '',
};
