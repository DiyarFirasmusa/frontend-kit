import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start';
import { publicEnv } from '@/shared/env/public-env';
import { getServerEnv } from '@/shared/server/env.server';
import {
  bodySizeProblem,
  canonicalRedirect,
  createNonce,
  rememberNonce,
  robotsHeader,
  securityHeaders,
} from '@/shared/server/security-headers';

/** Refuses oversized server function bodies before anything reads them. Runs first. */
const bodyLimitMiddleware = createMiddleware().server(async ({ next, request }) => {
  const problem = bodySizeProblem(request);
  if (problem !== undefined) {
    return new Response(null, { status: problem });
  }
  return next();
});

/** Applies the canonical URL redirect and the security headers to every response. */
const securityMiddleware = createMiddleware().server(async ({ next, request }) => {
  const redirectTo = canonicalRedirect(new URL(request.url));
  if (redirectTo !== undefined) {
    return new Response(null, { status: 301, headers: { Location: redirectTo } });
  }

  const nonce = createNonce();
  rememberNonce(request, nonce);
  const result = await next();

  const headers: Record<string, string> = securityHeaders({
    nonce,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    mode: getServerEnv().CSP_MODE,
    upgradeInsecureRequests: publicEnv.VITE_SITE_URL.startsWith('https:'),
  });
  const robots = robotsHeader({
    allowIndexing: publicEnv.VITE_ALLOW_INDEXING,
    status: result.response.status,
  });
  if (robots !== undefined) {
    headers['X-Robots-Tag'] = robots;
  }

  // Set the headers on Start's own response object: rebuilding the Response loses its status.
  for (const [name, value] of Object.entries(headers)) {
    result.response.headers.set(name, value);
  }
  result.response.headers.delete('X-Powered-By');
  return result;
});

export const startInstance = createStart(() => ({
  requestMiddleware: [
    bodyLimitMiddleware,
    createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === 'serverFn' }),
    securityMiddleware,
  ],
}));
