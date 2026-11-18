---
paths:
  - "vite.config.ts"
  - "src/router.tsx"
  - "src/start.ts"
  - "src/routes/__root.tsx"
  - "src/env.ts"
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

## Env

- Browser-visible values are `VITE_*` and are read through `src/env.ts` (zod), never `import.meta.env` in a feature.
- A value without the prefix exists only in server functions (`process.env`). Never put a secret behind `VITE_`.

## Don't

- No `window` access at module top level; no `useEffect` just to dodge it: guard the effect's work, not the import.
- No second router instance outside `getRouter()`.
- No SSR-only code on a route under `_app/`: it would run in no place.
