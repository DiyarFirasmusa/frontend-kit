import { z } from 'zod';
import type { AccessTokenPayload } from '@/types/auth';

/* A claim of the wrong type is dropped, not trusted: the payload comes from
   the network. Only the claims the app reads are listed. */
const optionalClaim = <T extends z.ZodType>(schema: T) =>
  z
    .unknown()
    .transform((value) => schema.safeParse(value).data)
    .optional();

const accessTokenSchema = z.object({
  token_type: optionalClaim(z.string()),
  exp: optionalClaim(z.number()),
  iat: optionalClaim(z.number()),
  jti: optionalClaim(z.string()),
  sub: optionalClaim(z.string()),
  tenant_id: optionalClaim(z.string()),
  roles: optionalClaim(z.array(z.string())),
  permissions: optionalClaim(z.array(z.string())),
  scopes: optionalClaim(z.record(z.string(), z.string())),
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
