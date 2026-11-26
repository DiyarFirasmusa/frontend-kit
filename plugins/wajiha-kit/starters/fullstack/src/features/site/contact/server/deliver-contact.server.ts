import { publicEnv } from '@/shared/env/public-env';
import { getServerEnv } from '@/shared/server/env.server';
import type { ContactInput } from '../validations/contact-schema';

const WEBHOOK_TIMEOUT_MS = 8000;

export type DeliveryEnv = {
  CONTACT_WEBHOOK_URL?: string | undefined;
  /** The real site (VITE_ALLOW_INDEXING=true): demo mode is refused there. */
  productionSite: boolean;
};

const defaultEnv = (): DeliveryEnv => ({
  CONTACT_WEBHOOK_URL: getServerEnv().CONTACT_WEBHOOK_URL,
  productionSite: publicEnv.VITE_ALLOW_INDEXING,
});

/** Server log lines never contain what the visitor wrote, and never the webhook URL (it can hold a token). */
function failure(reason: string, detail: Record<string, string | number> = {}): false {
  console.error('[contact] message not delivered:', reason, detail);
  return false;
}

/** The useful part of a fetch error (timeout, DNS, refused), without the URL. */
function describeError(error: unknown): Record<string, string> {
  if (!(error instanceof Error)) {
    return { error: 'unknown' };
  }
  const cause: unknown = error.cause;
  const code =
    typeof cause === 'object' && cause !== null && 'code' in cause ? String(cause.code) : '';
  return code === '' ? { error: error.name } : { error: error.name, code };
}

/**
 * Hands a validated message to the configured webhook. Returns false (the visitor sees an error and keeps
 * the text) when it was not delivered. Without a webhook the message is accepted and discarded (demo mode),
 * but never on the real site: the server start check refuses that setup, and this refuses it again.
 * A honeypot hit is reported as a success without delivering anything, so a bot learns nothing.
 */
export async function deliverContact(
  input: ContactInput,
  env: DeliveryEnv = defaultEnv(),
): Promise<boolean> {
  if (input.contactRef.trim() !== '') {
    console.warn('[contact] honeypot filled: message dropped');
    return true;
  }
  const url = env.CONTACT_WEBHOOK_URL;
  if (url === undefined) {
    if (env.productionSite) {
      return failure('CONTACT_WEBHOOK_URL is not set on the real site');
    }
    console.warn(
      '[contact] demo mode: message accepted and discarded (CONTACT_WEBHOOK_URL is not set)',
    );
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
    return response.ok
      ? true
      : failure('the webhook answered with an error', { status: response.status });
  } catch (error) {
    return failure('the webhook could not be reached', describeError(error));
  }
}
