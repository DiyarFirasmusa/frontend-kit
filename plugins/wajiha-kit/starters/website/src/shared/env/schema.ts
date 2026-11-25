// One schema for every environment value. Plain relative imports only: vite.config.ts and
// scripts/*.ts load this file without the "@/" alias.
import { z } from 'zod';
import { DEFAULT_SITE_URL, isOrigin } from './origin.ts';

const emptyToUndefined = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const booleanText = z.enum(['true', 'false']).transform((value) => value === 'true');

/** Origin only: no path, no query, no trailing slash. */
const siteOrigin = z
  .string()
  .refine(
    isOrigin,
    'must be an origin without a path or a trailing slash, for example https://example.com',
  );

/**
 * Browser-visible values. Prefix VITE_ is what ships to the client, so no secret may live here.
 * The browser reads them through public-env.ts (no zod there); this schema checks them at build time.
 */
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

const problemsOf = (error: z.ZodError): string[] =>
  error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);

/** Checks every value and reports all problems at once, not only the first. */
export function validateEnv(raw: RawEnv): EnvResult {
  const parsed = envSchema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  return { ok: false, problems: problemsOf(parsed.error) };
}

/** Production builds must set these explicitly; the defaults above are for local work only. */
export function validateProductionEnv(raw: RawEnv): string[] {
  const problems: string[] = [];
  if (raw.VITE_SITE_URL === undefined || raw.VITE_SITE_URL.trim() === '') {
    problems.push('VITE_SITE_URL: required for a production build (the public origin of the site)');
  }
  return problems;
}

export const WEBHOOK_REQUIRED =
  'CONTACT_WEBHOOK_URL: required on the real site (VITE_ALLOW_INDEXING=true), otherwise contact messages would be lost';

/**
 * Checks the values the server reads when it runs (they can differ from the build machine, for example in
 * Docker). The real site (indexing on) must have somewhere to deliver contact messages: demo mode, which
 * accepts and discards them, is only for local work and staging copies.
 */
export function validateServerEnv(raw: RawEnv, options: { productionSite: boolean }): string[] {
  const parsed = serverEnvSchema.safeParse(raw);
  if (!parsed.success) {
    return problemsOf(parsed.error);
  }
  return options.productionSite && parsed.data.CONTACT_WEBHOOK_URL === undefined
    ? [WEBHOOK_REQUIRED]
    : [];
}

export const ENV_KEYS: string[] = Object.keys(envSchema.shape);
