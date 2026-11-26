import { z } from 'zod';

/**
 * Runtime validation of the `VITE_*` variables baked into the bundle. Missing
 * or malformed values are collected into `envError`, which main.tsx renders
 * as a readable screen instead of letting the app fail somewhere deep inside
 * an axios call with an empty base URL.
 */
/** True only for an absolute http(s) URL the URL parser accepts (rejects `https:///`). */
function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const envSchema = z
  .object({
    VITE_ENV: z
      .enum(['development', 'staging', 'production', 'test'])
      .default('development'),
    VITE_API_BASE_URL: z
      .string()
      .trim()
      .min(1, 'VITE_API_BASE_URL is required')
      .refine(
        isAbsoluteHttpUrl,
        'VITE_API_BASE_URL must be an absolute http(s) URL',
      )
      .transform((v) => v.replace(/\/+$/, '')),
    /** Optional. Empty or unset means "same as VITE_API_BASE_URL". */
    VITE_AUTH_BASE_URL: z
      .string()
      .trim()
      .optional()
      .default('')
      .refine(
        (v) => v === '' || isAbsoluteHttpUrl(v),
        'VITE_AUTH_BASE_URL must be an absolute http(s) URL',
      )
      .transform((v) => v.replace(/\/+$/, '')),
    VITE_SENTRY_DSN: z.string().trim().optional().default(''),
    VITE_APP_VERSION: z.string().trim().optional().default('0.0.0'),
    /**
     * Where the refresh token lives. "cookie": the backend sets an HttpOnly
     * cookie and the refresh call sends credentials, not a token. "session":
     * the token is kept in sessionStorage (the mock API and backends without
     * cookie support). The access token is always in memory only.
     */
    VITE_AUTH_REFRESH: z.enum(['cookie', 'session']).default('session'),
  })
  .transform((e) => ({
    ...e,
    VITE_AUTH_BASE_URL: e.VITE_AUTH_BASE_URL || e.VITE_API_BASE_URL,
  }));

export type Env = z.infer<typeof envSchema>;

function readRawEnv(): Record<string, string | undefined> {
  return {
    VITE_ENV: import.meta.env.VITE_ENV,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_AUTH_BASE_URL: import.meta.env.VITE_AUTH_BASE_URL,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
    VITE_AUTH_REFRESH: import.meta.env.VITE_AUTH_REFRESH || undefined,
  };
}

function formatIssues(issues: z.core.$ZodIssue[]): string {
  return issues
    .map((issue) => `• ${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('\n');
}

const parsed = envSchema.safeParse(readRawEnv());

/** Human-readable list of env problems, or null when everything is valid. */
export const envError: string | null = parsed.success
  ? null
  : formatIssues(parsed.error.issues);

/** Validated env. When invalid, falls back to safe defaults so imports never throw. */
export const env: Env = parsed.success
  ? parsed.data
  : {
      VITE_ENV: 'development',
      VITE_API_BASE_URL: '',
      VITE_AUTH_BASE_URL: '',
      VITE_SENTRY_DSN: '',
      VITE_APP_VERSION: '0.0.0',
      VITE_AUTH_REFRESH: 'session',
    };
