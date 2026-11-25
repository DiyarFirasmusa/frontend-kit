import { DEFAULT_SITE_URL, publicEnvSchema, type PublicEnv } from './schema';

/** Reads the browser-visible values. Never throws: the build already failed on bad values. */
export function readPublicEnv(raw: Record<string, unknown>): PublicEnv {
  const parsed = publicEnvSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }
  return { VITE_SITE_URL: DEFAULT_SITE_URL, VITE_ALLOW_INDEXING: false };
}

export const publicEnv: PublicEnv = readPublicEnv(import.meta.env);
