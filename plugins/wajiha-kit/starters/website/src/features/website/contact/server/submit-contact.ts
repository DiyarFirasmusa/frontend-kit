import { createServerFn } from '@tanstack/react-start';
import { contactSchema, type ContactInput } from '../validations/contact-schema';
import { deliverContact } from './deliver-contact.server';

export type SubmitResult = { ok: boolean };

/**
 * Same-origin RPC (CSRF and body-size protected in src/start.ts). Validates again on the server: the browser
 * is not trusted. Invalid input gets a plain { ok: false }, never the validation details: the browser form
 * already explains every field, so details here would only help someone probing the endpoint.
 */
export const submitContact = createServerFn({ method: 'POST' })
  .validator((input: ContactInput): ContactInput | null => {
    const parsed = contactSchema.safeParse(input);
    return parsed.success ? parsed.data : null;
  })
  .handler(async ({ data }): Promise<SubmitResult> => {
    if (data === null) {
      console.warn('[contact] invalid input refused');
      return { ok: false };
    }
    return { ok: await deliverContact(data) };
  });
