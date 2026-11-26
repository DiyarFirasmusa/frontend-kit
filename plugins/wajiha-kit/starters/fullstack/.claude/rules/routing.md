---
paths:
  - 'src/routes/**'
  - 'src/router.tsx'
  - 'src/start.ts'
  - 'src/shared/lib/admin-path.ts'
  - 'src/shared/server/**'
---

# Routing, rendering, headers

- Route files are thin: the path, `validateSearch`, guards, `head()`, the component import. UI and logic live in
  `src/features/*`. `src/routeTree.gen.ts` is generated: never edit it; `npm run dev` or `npm run build`
  regenerates it after you add or rename a route file.
- The language is the first URL segment. Public pages are under `$locale/` (the site header and footer come from
  `$locale.tsx`). The admin is under `$locale_/admin` (trailing underscore: the language stays in the URL but the
  site layout is not used). Every admin path starts with `/$locale/admin`.
- Public pages render on the server: title, description, canonical, hreflang and JSON-LD come from `head()` through
  `seo()`. A missing thing throws `notFound()` (a real 404), never a "not found" text with a 200.
- The admin layout route is `ssr: false` for a valid language and server-rendered for an invalid one
  (`/fr/admin` answers a real 404 with noindex). Do not remove that function.
- The admin route files are part of the public entry chunk. In them import admin code only with `import()` (guards,
  i18n and mocks are loaded that way in `beforeLoad`) or through split properties (`component`, `notFoundComponent`).
  `AdminLoading` and `adminHead` import nothing on purpose. After any change here run
  `npm run build:proof` and `npm run check:bundle` (it reads the source maps of every script each public page loads
  and fails on any `src/features/admin` or admin-only UI module that is not on the allow-list in `scripts/bundle-sources.ts`).
- Guards run in `beforeLoad`: `requireAuth` in `_shell.tsx`, `requireGuest` on login, `requirePermission` per page.
  A redirect after login goes through `safeReturnPath` (only paths inside the admin).
- Every admin page sets `head: adminHead('<feature>.title')`. An unknown admin URL renders `AdminMessage kind="notFound"`
  (its own `<main>`, texts from `src/shared/locales`, because the admin bundle is not loaded for it).
- Server middleware (`src/start.ts`): body limit, CSRF, canonical redirect, CSP with a per-request nonce, `X-Robots-Tag`.
  Security headers are set in one place (`src/shared/server/security-headers.ts`); do not add them in nginx.
- Module top-level code must be SSR-safe: no `window` or `document` outside effects and handlers. No module-level
  state shared between requests (the router, the i18n instance and the nonce are per request). Exceptions that are safe
  because they are only ever written in the browser: the Zustand stores in `shared/store` and `features/admin/store`,
  the admin QueryClient (`getAdminQueryClient()`, the admin is `ssr: false`) and the site i18n `fixedInstance`
  (`getFixedT` never changes its language). Anything new with module-level state must be client-only too.
- Admin route loaders only START work: `loader: async ({ deps }) => { (await import('.../prefetch')).prefetchX(deps); }`
  with `prefetchQuery` and no `await` on the request, so the page keeps its own loading, error and empty states. Never
  `ensureQueryData` in a loader (it would block the page), and never import TanStack Query or the QueryClient in
  `router.tsx` or in a route file outside a split property (it cost 4.6 KB gzip on every public page; and a
  `beforeLoad` return value must be serializable, which a QueryClient is not).
- Never add an admin route to `NAV` (`nav.config.ts`): the type forbids it, and the sitemap must not list the admin.
