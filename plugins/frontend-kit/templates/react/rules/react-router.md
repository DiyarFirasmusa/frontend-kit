---
paths:
  - "react-router.config.{js,ts}"
  - "/app/**/*.{js,jsx,ts,tsx}"
  - "/src/app/**/*.{js,jsx,ts,tsx}"
  - "apps/*/app/**/*.{js,jsx,ts,tsx}"
  - "**/*.server.{js,ts,tsx}"
  - "src/**/{router,routes}.{js,jsx,ts,tsx}"
  - "src/**/routes/**/*.{js,jsx,ts,tsx}"
  - "src/{main,App,app}.{js,jsx,ts,tsx}"
  - "src/**/*{loader,guard,middleware}*.{js,ts,tsx}"
---

# React Router

Applies only when `react-router` is a dependency; otherwise ignore this file. Write the mode in `project.md` first:
framework (`@react-router/dev`), data (`createBrowserRouter`) or declarative (`BrowserRouter`).

- Imports, v7+: `react-router`; the DOM `RouterProvider` and `HydratedRouter` from `react-router/dom`. v6 keeps
  `react-router-dom`. v8 removed that package, the `data` meta argument (use `loaderData`) and the `v8_*` flags, and needs
  Node 22.22, React 19.2.7 and Vite 7.
- Search params: parse once, with defaults. Components use `useSearchParams()`; loaders, actions and middleware use the
  `url` argument (7.15+). In v8 `request.url` keeps `.data` and internal params: never route or authorise on it.

## Guards

- **A redirect in a parent loader does not stop child loaders**: they run in parallel. Guard with middleware on the layout
  (7.9+ behind `future.v8_middleware`, always on in 8; data mode: `middleware` on the route object). Without middleware
  every protected loader and action checks by itself.
- Server middleware runs on a client navigation only when a `.data` request happens: a guarded layout also exports
  `loader() { return null }`. Browser middleware (`clientMiddleware`) is UX, not security.
- Pass values down with `createContext` and `context.set` / `context.get`, not a plain object.
- Redirect targets from input pass `safeRedirect` (`security.md`).
- The built-in origin check skips resource routes and requests without Origin: those mutations check Origin or a token
  themselves, and session cookies are SameSite.

## Framework mode

- `app/routes.ts` is the route table: no `createRoutes()`, no `lazy`. Sections export `ErrorBoundary`.
- Route modules use `Route.*` types from `./+types/<file>`; run `react-router typegen` before the typecheck.
- A `*` route alone answers 200: its loader does `throw data(null, { status: 404 })`. Thrown data reaches the browser, so
  it holds no internals.
- Browser-held session: `ssr: false` with client loaders, actions and middleware only, a root `HydrateFallback` and no
  `window` during render. With SSR kept, a guarded `clientLoader` beside a `loader` sets `clientLoader.hydrate = true as const`.
- Secrets live in `*.server.*` modules. Do not introduce the unstable RSC mode.

## Data mode

- One module exports a `createRoutes()` factory (a fresh table per test): `lazy` per route, `errorElement` on each layout
  and the root, a `*` route for the 404 inside the layout.

## Declarative mode

- No loaders, actions or middleware. Don't migrate the mode unless asked.

## Titles

- React 19: a `<title>` in the route component, or the existing `meta` export (a child's array replaces the parent's).
  One way per app. A static `<title>` in a data-mode `index.html` wins: remove it or set the title with one hook.
