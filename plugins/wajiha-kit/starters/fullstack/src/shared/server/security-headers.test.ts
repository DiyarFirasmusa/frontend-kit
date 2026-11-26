import { describe, expect, it } from 'vitest';
import {
  bodySizeProblem,
  cacheControlFor,
  canonicalRedirect,
  MAX_SERVER_FN_BODY_BYTES,
  contentSecurityPolicy,
  createNonce,
  nonceFor,
  rememberNonce,
  robotsHeader,
  securityHeaders,
  THIRD_PARTY,
} from './security-headers';

const prod = { nonce: 'abc123', isDev: false, upgradeInsecureRequests: true };

describe('contentSecurityPolicy', () => {
  it('allows only the site itself, plus the request nonce for scripts', () => {
    const csp = contentSecurityPolicy(prod);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'nonce-abc123'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain('upgrade-insecure-requests');
  });

  it('never allows inline or eval scripts in production', () => {
    const csp = contentSecurityPolicy(prod);
    expect(csp).not.toContain("'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain('data:');
    expect(csp).not.toContain('ws:');
  });

  it('allows eval, inline styles and websockets only in development', () => {
    const csp = contentSecurityPolicy({ ...prod, isDev: true });
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain('ws:');
  });

  it('only upgrades requests when the site is served over HTTPS', () => {
    expect(contentSecurityPolicy({ ...prod, upgradeInsecureRequests: false })).not.toContain(
      'upgrade-insecure-requests',
    );
  });

  it('adds a third party only through the named constants', () => {
    THIRD_PARTY.script.push('https://analytics.example.test');
    try {
      expect(contentSecurityPolicy(prod)).toContain('https://analytics.example.test');
    } finally {
      THIRD_PARTY.script.pop();
    }
    expect(contentSecurityPolicy(prod)).not.toContain('analytics.example.test');
  });
});

describe('securityHeaders', () => {
  const headers = securityHeaders({ ...prod, mode: 'enforce', isProd: true });

  it('sends the full set in production', () => {
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(headers['Strict-Transport-Security']).toMatch(/^max-age=\d+; includeSubDomains/);
    expect(headers['Content-Security-Policy']).toBeDefined();
  });

  it('report-only mode uses the report-only header name and not the enforcing one', () => {
    const reportOnly = securityHeaders({ ...prod, mode: 'report-only', isProd: true });
    expect(reportOnly['Content-Security-Policy-Report-Only']).toBeDefined();
    expect(reportOnly['Content-Security-Policy']).toBeUndefined();
  });

  it('no HSTS outside production', () => {
    expect(
      securityHeaders({ ...prod, mode: 'enforce', isProd: false })['Strict-Transport-Security'],
    ).toBeUndefined();
  });
});

describe('nonces', () => {
  it('are unique and 128 bits', () => {
    const a = createNonce();
    const b = createNonce();
    expect(a).not.toBe(b);
    expect(atob(a)).toHaveLength(16);
  });

  it('are remembered per request object', () => {
    const request = new Request('https://example.test/');
    expect(nonceFor(request)).toBeUndefined();
    rememberNonce(request, 'n1');
    expect(nonceFor(request)).toBe('n1');
    expect(nonceFor(new Request('https://example.test/'))).toBeUndefined();
  });
});

describe('canonicalRedirect', () => {
  const target = (path: string) => canonicalRedirect(new URL(`https://example.test${path}`));

  it('redirects uppercase and trailing slashes to the one spelling, keeping the query', () => {
    expect(target('/AR/About')).toBe('/ar/about');
    expect(target('/ar/about/')).toBe('/ar/about');
    expect(target('/ar/News/?page=2')).toBe('/ar/news?page=2');
  });

  it('leaves canonical paths, the root, assets and server functions alone', () => {
    expect(target('/ar/about')).toBeUndefined();
    expect(target('/')).toBeUndefined();
    expect(target('/assets/Styles-AbC123.css')).toBeUndefined();
    expect(target('/_serverFn/AbCdEf')).toBeUndefined();
    expect(target('/Favicon.SVG')).toBeUndefined();
  });

  it('never answers with a protocol-relative Location (another host)', () => {
    expect(target('//evil.example/')).toBe('/evil.example');
    expect(target('///Evil/x')).toBe('/evil/x');
    expect(target('//')).toBe('/');
    expect(target('/ar//x')).toBeUndefined();
  });
});

describe('bodySizeProblem', () => {
  const post = (path: string, headers: Record<string, string>) =>
    new Request(`https://example.test${path}`, { method: 'POST', headers });

  it('lets small server function bodies and every other request through', () => {
    expect(bodySizeProblem(post('/_serverFn/abc', { 'content-length': '900' }))).toBeUndefined();
    expect(bodySizeProblem(new Request('https://example.test/_serverFn/abc'))).toBeUndefined();
    expect(bodySizeProblem(post('/ar/contact', {}))).toBeUndefined();
  });

  it('refuses a body over the limit (413) or without a length (411)', () => {
    const tooBig = String(MAX_SERVER_FN_BODY_BYTES + 1);
    expect(bodySizeProblem(post('/_serverFn/abc', { 'content-length': tooBig }))).toBe(413);
    expect(bodySizeProblem(post('/_serverFn/abc', { 'content-length': 'lots' }))).toBe(413);
    expect(bodySizeProblem(post('/_serverFn/abc', {}))).toBe(411);
  });
});

describe('robotsHeader', () => {
  it('is noindex for failed responses and for sites that may not be indexed', () => {
    expect(robotsHeader({ allowIndexing: true, status: 200 })).toBeUndefined();
    expect(robotsHeader({ allowIndexing: true, status: 404 })).toBe('noindex, nofollow');
    expect(robotsHeader({ allowIndexing: true, status: 500 })).toBe('noindex, nofollow');
    expect(robotsHeader({ allowIndexing: false, status: 200 })).toBe('noindex, nofollow');
  });

  it('is always noindex for the admin, even on the real site', () => {
    expect(robotsHeader({ allowIndexing: true, status: 200, pathname: '/ar/admin' })).toBe(
      'noindex, nofollow',
    );
    expect(
      robotsHeader({ allowIndexing: true, status: 200, pathname: '/en/admin/suppliers' }),
    ).toBe('noindex, nofollow');
    expect(
      robotsHeader({ allowIndexing: true, status: 200, pathname: '/en/about' }),
    ).toBeUndefined();
  });
});

describe('cacheControlFor', () => {
  const html = {
    pathname: '/en/about',
    status: 200,
    contentType: 'text/html; charset=utf-8',
    existing: null,
  };

  it('lets the browser keep a public page but never a shared cache (the nonce is per response)', () => {
    expect(cacheControlFor(html)).toBe('private, no-cache');
    expect(cacheControlFor({ ...html, pathname: '/ar' })).toBe('private, no-cache');
  });

  it('never stores a failed page or a server function answer', () => {
    expect(cacheControlFor({ ...html, status: 404 })).toBe('no-store');
    expect(cacheControlFor({ ...html, status: 500 })).toBe('no-store');
    expect(
      cacheControlFor({ ...html, pathname: '/_serverFn/abc', contentType: 'application/json' }),
    ).toBe('no-store');
  });

  it('never stores any admin response: pages, login, its 404s and a wrong language', () => {
    for (const pathname of [
      '/ar/admin',
      '/en/admin/login',
      '/en/admin/suppliers',
      '/ar/admin/nope',
      '/fr/admin',
    ]) {
      expect(cacheControlFor({ ...html, pathname })).toBe('private, no-store');
      expect(cacheControlFor({ ...html, pathname, status: 404 })).toBe('private, no-store');
    }
    expect(
      cacheControlFor({ ...html, pathname: '/en/admin', existing: 'public, max-age=60' }),
    ).toBe('private, no-store');
  });

  it('keeps a header the response set itself, and leaves non-HTML alone', () => {
    expect(
      cacheControlFor({
        ...html,
        pathname: '/robots.txt',
        contentType: 'text/plain',
        existing: 'public, max-age=0, s-maxage=3600',
      }),
    ).toBeUndefined();
    expect(cacheControlFor({ ...html, contentType: 'application/json' })).toBeUndefined();
  });
});

describe('contentSecurityPolicy: admin', () => {
  it('allows the admin API origin when it lives on another host, and same-origin workers', () => {
    const csp = contentSecurityPolicy({ ...prod, connectOrigins: ['https://api.example.com'] });
    expect(csp).toContain("connect-src 'self' https://api.example.com");
    expect(csp).toContain("worker-src 'self'");
  });
});
