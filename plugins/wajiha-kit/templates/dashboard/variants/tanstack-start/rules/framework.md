---
paths:
  - "vite.config.ts"
  - "e2e/serve-spa.ts"
  - "src/router.tsx"
  - "src/start.ts"
  - "src/routes/__root.tsx"
  - "src/routes/$.tsx"
  - "src/client.tsx"
  - "src/env.ts"
  - "src/**/page-loading.tsx"
  - "src/**/language-sync.tsx"
  - "src/**/i18n.ts"
---

# TanStack Start, SPA mode (the dashboard on Start)

The dashboard is a client-rendered app that happens to run on Start: same router, same rules as the Vite
dashboard (`routing.md`, `permissions.md`), plus a prerendered shell and optional server functions.

## Setup

- `vite.config.ts` uses `tanstackStart({ spa: { enabled: true } })` (plus the React plugin after it). The build then
  renders only the root route into `/_shell.html`; matched routes show the router's `pendingComponent` until the
  browser takes over. Keep `maskPath` at its default `/`.
- `src/router.tsx` exports `getRouter()` (a new router per call), with `context: { queryClient }`,
  `defaultPreload: 'intent'`, `defaultPreloadStaleTime: 0`, `scrollRestoration: true`, and
  `defaultErrorComponent` / `defaultNotFoundComponent`. The `Register` declaration stays in this file.
- `src/routes/__root.tsx` renders the document: `<html lang dir>`, `<HeadContent />`, `<body>` ending in
  `<Scripts />`, with `createRootRouteWithContext<RouterContext>()`. Head: charset, viewport,
  `<meta name="robots" content="noindex, nofollow">`, icons. There is no `index.html` and no `main.tsx`.
- The host must serve `/_shell.html` for every unknown path (the SPA fallback), and must let `/_serverFn/*` and any
  `/api/*` through before that fallback. Say so in `project.md` once the host is known.

## What runs where

- The shell is rendered on the server **at build time**: module top-level code and the root route must not touch
  `window`, `document`, `localStorage` or `sessionStorage` outside an effect or an event handler.
- Everything under `_app/` and `_auth/` runs in the browser only. Guards (`beforeLoad`) read the browser-held session,
  exactly as in `routing.md`; they never read cookies on the server.
- Server functions (`createServerFn`) are optional here. Use one only for a secret that must not reach the browser
  (a BFF token exchange, a signed upload URL). The data layer stays axios + TanStack Query (`api-layer.md`).
  Server functions are same-origin RPC: once the project defines `src/start.ts`, add `createCsrfMiddleware()` there
  itself (without a `start.ts` Start installs it).

## Session and language before hydration

- The shell is prerendered once, with the default language (`<html lang="ar" dir="rtl">`) and no session. A user whose
  language is English, or who is signed in, must not see that default flash or trigger a hydration mismatch.
- Add a custom client entry `src/client.tsx` (`hydrateRoot(document, <StartClient />)`) that awaits
  `bootstrapSession()` (the session restore in `api-layer.md`) **before** hydrating, so the first guard run already
  knows the user and the permissions.
- Set `<html lang dir>` from the stored language with a small inline script in the root route's `head` (it runs before
  paint), with `suppressHydrationWarning` on `<html>`. Never read `localStorage` during the first render to pick text.

## What the shell shows must hydrate unchanged (React error #418)

The shell holds the root route and the router's `pendingComponent`, in the default language, whatever the URL is.
That pending boundary can hydrate **late**, after effects ran and the language switched (a guard redirect does it).

- Text inside the shell (the `pendingComponent`, anything in the root) uses the default language until it is hydrated.
  Restoring the language earlier or later does not fix this; this does:

  ```tsx
  const hydrated = useHydrated(); // @tanstack/react-router
  const label = t('app.loading', hydrated ? {} : { lng: DEFAULT_LANGUAGE });
  ```

- An unknown URL is a route of its own: `src/routes/$.tsx` renders the 404 page. Left to the root `notFoundComponent`,
  the first render has no pending boundary where the shell has one, and every direct load of a bad URL fails to
  hydrate. Keep `notFoundComponent` as well, for a `notFound()` thrown by a loader.
  `npm run build` (like `npm run dev`) regenerates `routeTree.gen.ts` after the file is added; then typecheck.
- Prove it on the production build, with both languages and a direct load of: a page, a page that redirects to `/403`,
  an unknown URL. No console error in any of them (a navigation inside the app never shows this bug).

## E2E

- Serve the client build with `e2e/serve-spa.ts` (shipped with the variant) and mock the API in the browser; not
  `vite preview`, not `--outDir`. `testing.md` ("Dashboard specifics") has the reasons and the config.

## Env

- Browser-visible values are `VITE_*` and are read through `src/env.ts` (zod), never `import.meta.env` in a feature.
- A value without the prefix exists only in server functions (`process.env`). Never put a secret behind `VITE_`.

## Don't

- No `window` access at module top level; no `useEffect` just to dodge it: guard the effect's work, not the import.
- No second router instance outside `getRouter()`.
- No SSR-only code on a route under `_app/`: it would run in no place.
