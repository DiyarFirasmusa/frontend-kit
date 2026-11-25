import { serverEnvSchema, type ServerEnv } from '@/shared/env/schema';

/** Read per call, not at module scope: some hosts only provide the environment per request. */
export function getServerEnv(raw: Record<string, string | undefined> = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }
  // Safe fallback; the build-time check is where a bad value is reported.
  return { CSP_MODE: 'enforce', CONTACT_WEBHOOK_URL: undefined };
}
