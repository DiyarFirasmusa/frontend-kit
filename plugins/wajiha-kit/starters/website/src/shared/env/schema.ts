// One schema for every environment value. Plain relative imports only: vite.config.ts and
// scripts/*.ts load this file without the "@/" alias.
import { z } from 'zod';

const emptyToUndefined = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const booleanText = z.enum(['true', 'false']).transform((value) => value === 'true');

function isOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.pathname === '/' &&
      url.search === '' &&
      url.hash === '' &&
      !value.endsWith('/')
    );
  } catch {
    return false;
  }
}

/** Origin only: no path, no query, no trailing slash. */
const siteOrigin = z
  .string()
  .refine(
    isOrigin,
    'must be an origin without a path or a trailing slash, for example https://example.com',
  );

export const DEFAULT_SITE_URL = 'http://localhost:5190';

/** Browser-visible values. Prefix VITE_ is what ships to the client, so no secret may live here. */
export const publicEnvSchema = z.object({
  VITE_SITE_URL: z.preprocess(emptyToUndefined, siteOrigin.default(DEFAULT_SITE_URL)),
  VITE_ALLOW_INDEXING: z.preprocess(emptyToUndefined, booleanText.default(false)),
});

/** Server-only values: read only inside *.server.ts files or server functions. */
export const serverEnvSchema = z.object({
  CSP_MODE: z.preprocess(emptyToUndefined, z.enum(['enforce', 'report-only']).default('enforce')),
  CONTACT_WEBHOOK_URL: z.preprocess(emptyToUndefined, z.url().optional()),
});

export const envSchema = publicEnvSchema.extend(serverEnvSchema.shape);

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type AppEnv = z.infer<typeof envSchema>;

export type EnvResult = { ok: true; value: AppEnv } | { ok: false; problems: string[] };

type RawEnv = Record<string, string | undefined>;

/** Checks every value and reports all problems at once, not only the first. */
export function validateEnv(raw: RawEnv): EnvResult {
  const parsed = envSchema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  return {
    ok: false,
    problems: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}

/** Production builds must set these explicitly; the defaults above are for local work only. */
export function validateProductionEnv(raw: RawEnv): string[] {
  const problems: string[] = [];
  if (raw.VITE_SITE_URL === undefined || raw.VITE_SITE_URL.trim() === '') {
    problems.push('VITE_SITE_URL: required for a production build (the public origin of the site)');
  }
  return problems;
}

export const ENV_KEYS: string[] = Object.keys(envSchema.shape);
