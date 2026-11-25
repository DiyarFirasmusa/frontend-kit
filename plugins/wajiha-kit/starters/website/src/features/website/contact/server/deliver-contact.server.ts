import { getServerEnv } from '@/shared/server/env.server';
import type { ContactInput } from '../validations/contact-schema';

const WEBHOOK_TIMEOUT_MS = 8000;

/**
 * Hands a validated message to the configured webhook, or accepts and discards it (demo mode).
 * A honeypot hit is reported as a success without delivering anything, so a bot learns nothing.
 * Returns false only when a configured webhook failed.
 */
export async function deliverContact(
  input: ContactInput,
  env: { CONTACT_WEBHOOK_URL?: string | undefined } = getServerEnv(),
): Promise<boolean> {
  if (input.website.trim() !== '') {
    return true;
  }
  const url = env.CONTACT_WEBHOOK_URL;
  if (url === undefined) {
    return true;
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
      }),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });
    return response.ok;
  } catch {
    return false;
  }
}
