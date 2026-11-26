// The browser-visible values, read by hand on purpose: this file is in every page's JavaScript, and zod
// would add about 20 KB gzip to it. The full check (schema.ts, zod) runs at build time, so the values that
// reach this file were already validated; here a bad value only falls back to the safe default.
import { DEFAULT_SITE_URL, isOrigin } from './origin.ts';

export type PublicEnv = {
  VITE_SITE_URL: string;
  VITE_ALLOW_INDEXING: boolean;
  VITE_ADMIN_API_URL: string;
  VITE_ADMIN_API_MOCK: boolean;
};

const DEFAULT_ADMIN_API_URL = '/api';

/** Never throws. */
export function readPublicEnv(raw: Record<string, unknown>): PublicEnv {
  const siteUrl = raw['VITE_SITE_URL'];
  const adminApi = raw['VITE_ADMIN_API_URL'];
  return {
    VITE_SITE_URL: typeof siteUrl === 'string' && isOrigin(siteUrl) ? siteUrl : DEFAULT_SITE_URL,
    VITE_ALLOW_INDEXING: raw['VITE_ALLOW_INDEXING'] === 'true',
    VITE_ADMIN_API_URL:
      typeof adminApi === 'string' && adminApi.trim() !== ''
        ? adminApi.trim()
        : DEFAULT_ADMIN_API_URL,
    VITE_ADMIN_API_MOCK: raw['VITE_ADMIN_API_MOCK'] === 'true',
  };
}

export const publicEnv: PublicEnv = readPublicEnv(import.meta.env);
