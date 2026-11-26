// Relative imports: the Nitro start plugin (check-env-plugin.ts) bundles this file without the "@/" alias.
import { publicEnv } from '../env/public-env.ts';
import { serverEnvSchema, validateServerEnv, type ServerEnv } from '../env/schema.ts';

type RawEnv = Record<string, string | undefined>;

/**
 * Read per call, not at module scope: some hosts only provide the environment per request.
 * A bad value throws (the request fails with 500 and the reason is logged) instead of being replaced by a
 * default: a silent fallback once dropped the contact webhook because another value had a typo.
 * The server start check (check-env-plugin.ts) normally stops a bad value much earlier.
 */
export function getServerEnv(raw: RawEnv = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }
  throw new Error(`Invalid server environment: ${checkServerEnv(raw).join('; ')}`);
}

/** Every problem with the values this server runs with, including "the real site has no contact webhook". */
export function checkServerEnv(raw: RawEnv = process.env): string[] {
  return validateServerEnv(raw, { productionSite: publicEnv.VITE_ALLOW_INDEXING });
}
