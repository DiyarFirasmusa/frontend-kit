// Plain helpers shared by the zod schema (build and server) and public-env.ts (browser).
// No imports here: this file ships to the browser, so it must stay tiny and must not pull in zod.

export const DEFAULT_SITE_URL = 'http://localhost:5190';

/** An origin only: http(s), no path, no query, no trailing slash. */
export function isOrigin(value: string): boolean {
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
