import { z } from 'zod';
import type { AccessTokenPayload } from '@/types/auth';

/* The payload comes from the network, so each claim is read on its own: a bad
   value is dropped, never trusted, and it never takes a good claim with it.
   An id may be a number (many backends use numeric ids); a list keeps its
   string entries and loses the rest (deny by default for permissions). */
type Reader<T> = (value: unknown) => T | null;

const asText: Reader<string> = (value) => {
  if (typeof value === 'string') {
    return value;
  }
  return typeof value === 'number' && Number.isFinite(value)
    ? String(value)
    : null;
};

const asSeconds: Reader<number> = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asStrings: Reader<string[]> = (value) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : null;

const asStringMap: Reader<Record<string, string>> = (value) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  const entries = Object.entries(value).flatMap(([key, item]) =>
    typeof item === 'string' ? [[key, item] as const] : [],
  );
  return Object.fromEntries(entries);
};

const claim = <T>(read: Reader<T>) =>
  z
    .unknown()
    .transform((value) => read(value) ?? undefined)
    .optional();

const accessTokenSchema = z.object({
  token_type: claim((value) => (typeof value === 'string' ? value : null)),
  exp: claim(asSeconds),
  iat: claim(asSeconds),
  jti: claim(asText),
  sub: claim(asText),
  tenant_id: claim(asText),
  roles: claim(asStrings),
  permissions: claim(asStrings),
  scopes: claim(asStringMap),
});

/** The claims of an access token, or `null` when it is not a readable JWT. */
export function decodeJwt(token: string): AccessTokenPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) {
      return null;
    }
    const b64 = part.replaceAll('-', '+').replaceAll('_', '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.codePointAt(0) ?? 0);
    return accessTokenSchema.parse(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}
