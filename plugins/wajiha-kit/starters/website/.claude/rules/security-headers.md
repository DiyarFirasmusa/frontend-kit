---
paths:
  - 'src/shared/server/**'
  - 'src/start.ts'
  - 'vite.config.ts'
  - 'deploy/**'
  - 'Dockerfile'
  - 'docker-compose.yml'
  - 'e2e/raw/security-headers.spec.ts'
  - 'e2e/raw/hardening.spec.ts'
---

# Security headers, CSP, caching

- Headers are set in one place: `securityHeaders()` in `src/shared/server/security-headers.ts`, applied to every
  response by the request middleware in `src/start.ts`. Files served straight from `public/` and the build skip that
  middleware, so they get theirs from the Nitro `routeRules` in `vite.config.ts` (`STATIC_FILE_HEADERS`,
  `STATIC_IMAGE_HEADERS`). Do not add the same header in nginx or a CDN: two sources drift apart. A new file type in
  `public/` needs a route rule.
- CSP: `default-src 'self'`, scripts `'self'` plus the request nonce, `style-src 'self'`, no `data:`, no eval, no inline
  style, `frame-ancestors 'none'`. Eval, inline styles and websockets are allowed in development only (`isDev`). A new
  third party (analytics, map, captcha, video) is added to the matching list of `THIRD_PARTY` and nowhere else; the
  unit test and `e2e/raw/security-headers.spec.ts` still have to pass.
- The nonce is made per request (`createNonce`), remembered by `rememberNonce(request, nonce)`, handed to the router
  (`getRouter` -> `ssr: { nonce }`) and so lands on TanStack's inline scripts and on the theme init script. Never put
  an inline script in a component without the nonce; JSON-LD goes through `serializeJsonLd` (it escapes `<`).
- `CSP_MODE=report-only` for a first rollout, then `enforce`. Every e2e test fails on a CSP violation
  (`securitypolicyviolation` is turned into a console error in `e2e/fixtures/app.ts`): fix the cause, do not allow it.
- Caching: pages carry a per-response nonce, so they get `private, no-cache`; failed pages and server function answers
  get `no-store`; hashed `/assets/**` are `immutable` for a year; images one hour; `robots.txt` and `sitemap.xml` set
  their own. `cacheControlFor` fills in only what a response did not set.
- Other limits in `src/start.ts`: server function bodies over 16 KB get 413 (411 without a length), a CSRF check on
  server functions, `X-Powered-By` removed, `X-Robots-Tag: noindex` on failures and on non-production sites.
- `deploy/nginx/site.conf` holds hardening, size and time limits, rate limiting of `/_serverFn/`, gzip for pages and
  the real client IP; never headers. It is not run in this repository: `nginx -t` before every deploy. HSTS uses
  `includeSubDomains`: remove that part first if a sibling subdomain still runs on plain HTTP.
- Never serve visitor uploads from this origin. Never put a secret in a `VITE_*` value or a log line.
