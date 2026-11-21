# Routing and navigation

Follow the router the project uses (`stack.router`: Next.js, TanStack Router/Start, React Router/Remix, none). Read the version
from `package.json`, not from memory.

- **Routes are thin**: the route file wires data loading, guards and the page component; no business logic.
- **Guards**: every route behind login redirects to sign-in and returns the user after login; redirect targets are
  validated against an allow-list (no open redirects, see `auth.md`).
- **Code-split by route**; heavy libraries (charts, editors, maps) load on demand.
- **Each page** sets its title and description; pages with a real "not found" return a real 404 status where the
  framework supports it (a client-only app cannot: say so, and make the host serve a 404 for unknown paths).
- **Links are real links** (`<a>`/the framework's `Link`), so middle-click, copy and crawlers work; buttons are for actions.
- **Typed params and search params**: parse and validate them once at the route boundary, with defaults.
- **Focus and scroll**: after navigation move focus to the page's main heading and restore scroll sensibly.

## React Router (data mode or framework mode)

- One module lists the routes and exports a `createRoutes()` factory (tests need a fresh table).
- Guards are `loader` / `clientLoader` functions that `throw redirect(...)`. An unreachable API is an error shown by the
  route's `errorElement` with a Retry, never a redirect to sign-in.
- `lazy` per route; an `errorElement` per layout and one at the root; a `*` route for the 404 inside the layout.
- Search params: parse `useSearchParams` once through a zod helper that applies defaults and drops invalid values.
- Framework mode with a browser-held session: `ssr: false` or `clientLoader`s, and a comment saying why.
- Titles: `meta` (framework mode) or one `useDocumentTitle` hook. A static `<title>` in `index.html` wins over head tags.

## Next.js (App Router)

- `page.tsx` is a thin default export rendering one container; containers that use state, effects or a browser-held session
  are `'use client'`.
- Next 16 Cache Components: runtime data (`usePathname`, `useSearchParams`, cookies) read outside `<Suspense>` fails the build.
  Wrap the header parts and pages that read them.
- A `title` in a layout replaces a `title.template` for its children: set the template once, give pages `title` strings.
- A `notFound()` after the first byte streamed still answers 200: mark such pages `noindex` and say so in the report.
- Typecheck is `next typegen && tsc --noEmit` (route types are generated). `eslint-config-next` 16 runs the React Compiler rules:
  no reading or writing refs during render; put one-shot guards in the event handler.
- Credential forms are `method="post"` with the submit disabled until hydrated, so a pre-hydration submit never puts a
  password in the URL.

## TanStack Router / Start

File routes under `src/routes/`, `beforeLoad` guards, `validateSearch`, generated `routeTree.gen.ts` (never edited): see `react.md`.
