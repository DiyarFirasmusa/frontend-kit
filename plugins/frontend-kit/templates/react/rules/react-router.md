---
paths:
  - "react-router.config.{js,ts}"
  - "app/**/*.{js,jsx,ts,tsx}"
  - "src/app/**/*.{js,jsx,ts,tsx}"
  - "**/*.server.{js,ts,tsx}"
  - "src/**/{router,routes}.{js,jsx,ts,tsx}"
  - "src/**/routes/**/*.{js,jsx,ts,tsx}"
  - "src/{main,App,app}.{js,jsx,ts,tsx}"
  - "src/**/*{loader,guard,middleware}*.{js,ts,tsx}"
---

# React Router (framework, data or declarative mode)

Loads only in projects that depend on `react-router`. Version 8 removed `react-router-dom`, the `data` meta argument and
the old flag names; it needs Node 22.22 and React 19.2.7 (changelog). Import everything from `react-router`.

- Write the mode in `project.md` first: framework (route modules, `loader` and `action` run on the server), data
  (`createBrowserRouter`) or declarative (`BrowserRouter`). The rules below depend on it.
- **A redirect in a parent loader does not stop child loaders.** Child loaders start in parallel. Each loader that reads
  private data checks the session itself, or use route middleware (`middleware` export in framework mode) so the check runs
  before any loader.
- Redirect targets after login are same-site paths, validated (`shared/rules/security.md`, `react/auth.md`).
- **Framework mode:** a `meta` export sets the title; the `index.html` title is not used. `HydrateFallback` shows while a
  client-only route hydrates. `clientLoader` runs in the browser.
- A `*` route alone answers 200 in framework mode. For a real 404, throw `new Response(null, { status: 404 })` from a loader.
- **Data mode:** a `createRoutes()` factory, a fresh `createMemoryRouter` per test (`shared/rules/testing.md`), `lazy` per
  route, and `errorElement` on each layout and at the root.
- Run `react-router typegen` before the typecheck; route types are generated.
- Search params: components read `useSearchParams()`; loaders read the request URL, not `useSearchParams()`.
