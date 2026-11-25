import { createServerFn } from '@tanstack/react-start';
import { contactSchema } from '../validations/contact-schema';
import { deliverContact } from './deliver-contact.server';

/** Same-origin RPC (CSRF-protected in src/start.ts). Validates again on the server: the browser is not trusted. */
export const submitContact = createServerFn({ method: 'POST' })
  .validator(contactSchema)
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    return { ok: await deliverContact(data) };
  });
