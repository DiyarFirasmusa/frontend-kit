// Security headers: one module, set in one place (the request middleware in src/start.ts), tested in
// security-headers.test.ts and asserted again against the built server in e2e/raw/security-headers.spec.ts.
// Do not set the same header in nginx or a CDN as well: two sources drift apart.
//
// Rollout: CSP_MODE=report-only sends Content-Security-Policy-Report-Only first; switch to "enforce" when the
// browser console shows no violations. Nonces: every response gets a fresh nonce, and TanStack Start puts it on
// its own inline scripts, so script-src needs no 'unsafe-inline'.

import { isAdminPath } from '../lib/admin-path.ts';

const SELF = "'self'";
const NONE = "'none'";

/**
 * Third parties the site is allowed to talk to. Empty by default: the starter loads nothing from outside.
 * Add a host here (and nowhere else) when you add analytics, maps, a captcha or a video player.
 * Example: ANALYTICS.script.push('https://analytics.example.com').
 */
export const THIRD_PARTY = {
  script: [] as string[],
  connect: [] as string[],
  img: [] as string[],
  frame: [] as string[],
  style: [] as string[],
  font: [] as string[],
};

export type CspOptions = {
  /** Fresh random value per response. */
  nonce: string;
  /** Development needs eval and websockets for hot reload; production never gets them. */
  isDev: boolean;
  /** Only when the site is served over HTTPS (it would break plain-HTTP localhost). */
  upgradeInsecureRequests: boolean;
  /** Extra origins the page may call, for example the admin API when it lives on another host. */
  connectOrigins?: readonly string[];
};

/** The origin of an absolute http(s) URL, or undefined for a path on this site (/api). */
export function originOf(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.origin : undefined;
  } catch {
    return undefined;
  }
}

export function contentSecurityPolicy(options: CspOptions): string {
  const { nonce, isDev, upgradeInsecureRequests, connectOrigins = [] } = options;
  const directives: Record<string, string[]> = {
    'default-src': [SELF],
    'script-src': [
      SELF,
      `'nonce-${nonce}'`,
      ...(isDev ? ["'unsafe-eval'"] : []),
      ...THIRD_PARTY.script,
    ],
    'style-src': [SELF, ...(isDev ? ["'unsafe-inline'"] : []), ...THIRD_PARTY.style],
    'img-src': [SELF, ...THIRD_PARTY.img],
    'font-src': [SELF, ...THIRD_PARTY.font],
    'connect-src': [
      SELF,
      ...(isDev ? ['ws:', 'wss:'] : []),
      ...connectOrigins,
      ...THIRD_PARTY.connect,
    ],
    // The admin's mock API runs as a service worker from this origin (only when VITE_ADMIN_API_MOCK=true).
    'worker-src': [SELF],
    'frame-src': THIRD_PARTY.frame.length > 0 ? THIRD_PARTY.frame : [NONE],
    'object-src': [NONE],
    'base-uri': [SELF],
    'form-action': [SELF],
    'frame-ancestors': [NONE],
  };
  const parts = Object.entries(directives).map(([name, sources]) => `${name} ${sources.join(' ')}`);
  if (upgradeInsecureRequests) {
    parts.push('upgrade-insecure-requests');
  }
  return parts.join('; ');
}

export const HSTS = 'max-age=31536000; includeSubDomains';

export type HeaderOptions = CspOptions & { mode: 'enforce' | 'report-only'; isProd: boolean };

/** The full header set for an HTML response. */
export function securityHeaders(options: HeaderOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    [options.mode === 'enforce'
      ? 'Content-Security-Policy'
      : 'Content-Security-Policy-Report-Only']: contentSecurityPolicy(options),
  };
  if (options.isProd) {
    // Browsers ignore HSTS over plain HTTP, so this is harmless on localhost and required behind HTTPS.
    headers['Strict-Transport-Security'] = HSTS;
  }
  return headers;
}

/** A fresh nonce: 128 random bits, base64. */
export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/** The nonce of a request, so getRouter() can hand it to the router for the same response. */
const nonces = new WeakMap<Request, string>();

export function rememberNonce(request: Request, nonce: string): void {
  nonces.set(request, nonce);
}

export function nonceFor(request: Request): string | undefined {
  return nonces.get(request);
}

/**
 * Where a request for a page should really go: uppercase letters and a trailing slash are redirected (301)
 * to the one canonical spelling. Returns undefined when the path is already canonical or is not a page
 * (assets, server functions and files keep their case: hashed file names are case-sensitive).
 */
export function canonicalRedirect(url: URL): string | undefined {
  const { pathname, search } = url;
  const isPage =
    !pathname.startsWith('/assets/') &&
    !pathname.toLowerCase().startsWith('/_serverfn') &&
    !/\.[a-z0-9]+$/i.test(pathname);
  if (!isPage) {
    return undefined;
  }
  // Collapse leading slashes first: a Location of "//evil.example" would be read as another host.
  let target = pathname.toLowerCase().replace(/^\/{2,}/, '/');
  if (target.length > 1) {
    target = target.replace(/\/+$/, '');
  }
  return target === pathname ? undefined : `${target}${search}`;
}

/** Largest server function request body the app reads (the contact form sends about 3 KB at most). */
export const MAX_SERVER_FN_BODY_BYTES = 16 * 1024;

/**
 * Refuses an oversized server function request before its body is read: 413 when Content-Length is too
 * big, 411 when it is missing (browsers always send it for these requests). nginx has its own limit, but
 * the image can run without nginx. Returns undefined when the request may go on.
 */
export function bodySizeProblem(request: Request): 411 | 413 | undefined {
  const isServerFn = new URL(request.url).pathname.toLowerCase().startsWith('/_serverfn');
  if (!isServerFn || request.method === 'GET' || request.method === 'HEAD') {
    return undefined;
  }
  const length = request.headers.get('content-length');
  if (length === null) {
    return 411;
  }
  const bytes = Number(length);
  return Number.isFinite(bytes) && bytes <= MAX_SERVER_FN_BODY_BYTES ? undefined : 413;
}

/**
 * Headers for files served straight from public/ and the build (they never reach the request middleware
 * above). Used by the Nitro route rules in vite.config.ts. Images get a CSP that blocks scripts, so an SVG
 * opened on its own cannot run code. Never serve files uploaded by visitors from this origin.
 */
export const STATIC_FILE_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export const STATIC_IMAGE_HEADERS: Record<string, string> = {
  ...STATIC_FILE_HEADERS,
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  // Not hashed, so a short cache: a replaced image shows up within the hour.
  'Cache-Control': 'public, max-age=3600',
};

/**
 * X-Robots-Tag: a copy of the page's robots meta for crawlers that read headers, and the only signal
 * that works for non-HTML files. Failed responses, non-production sites and the admin are never indexed.
 * The admin is not disallowed in robots.txt on purpose: a crawler that may not fetch a page never sees
 * its noindex, and can still list the bare URL.
 */
export function robotsHeader(input: {
  allowIndexing: boolean;
  status: number;
  pathname?: string;
}): string | undefined {
  const admin = input.pathname !== undefined && isAdminPath(input.pathname);
  return !input.allowIndexing || input.status >= 400 || admin ? 'noindex, nofollow' : undefined;
}
