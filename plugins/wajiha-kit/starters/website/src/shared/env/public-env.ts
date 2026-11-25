// The browser-visible values, read by hand on purpose: this file is in every page's JavaScript, and zod
// would add about 20 KB gzip to it. The full check (schema.ts, zod) runs at build time, so the values that
// reach this file were already validated; here a bad value only falls back to the safe default.
import { DEFAULT_SITE_URL, isOrigin } from './origin.ts';

export type PublicEnv = {
  VITE_SITE_URL: string;
  VITE_ALLOW_INDEXING: boolean;
};

/** Never throws. */
export function readPublicEnv(raw: Record<string, unknown>): PublicEnv {
  const siteUrl = raw['VITE_SITE_URL'];
  return {
    VITE_SITE_URL: typeof siteUrl === 'string' && isOrigin(siteUrl) ? siteUrl : DEFAULT_SITE_URL,
    VITE_ALLOW_INDEXING: raw['VITE_ALLOW_INDEXING'] === 'true',
  };
}

export const publicEnv: PublicEnv = readPublicEnv(import.meta.env);
