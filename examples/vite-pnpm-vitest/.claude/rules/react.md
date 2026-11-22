---
paths:
  - "src/**/*.{ts,tsx}"
---

# React + TypeScript

The project's own pattern wins over the file, export and folder examples here (`project.md`, the nearest code).
React 19, strict TypeScript, Vite: a client-only app with no router and no data library yet. The router lines below
(`createFileRoute`, `beforeLoad`, `Route`, `src/routes/`) and the Query names are TanStack's, as examples: keep the intent
(thin routes, guards in the route layer, params validated once); `routing.md` and `data-and-state.md` win.
No Server Components, no `'use client'`, no Next.js imports.

## TypeScript

- Strict. Never `any` — use `unknown` and narrow. Never `@ts-ignore` /
  `@ts-expect-error`; fix the type.
- Data from outside the type system (`JSON.parse`, `response.json()`, storage, URL, env) is `unknown` until it is
  parsed (type guards until the project has a schema library); auth, permission and money responses too, whatever their
  generated type says. No cast after.
- Type-only imports use `import type`.
- `interface` for object shapes, `type` for unions and aliases.
- Backend shapes come from the generated API types (never hand-edit).
  Fields stay exactly as the API sends them.
- Enum-like values: `const X = { … } as const` + a union type. Config
  objects: `as const satisfies T`.
- Avoid non-null `!`; check and narrow instead.

## Components

- Function components (the one error boundary excepted), props typed with an interface above the component.
- React 19: `ref` is a prop (no new `forwardRef`), callback refs use a block body, `useRef` takes an argument, and
  `ref.current` is never touched during render.
- Every component is a **named** export, one exported component per file.
  Route files export `Route` (TanStack Router) and nothing else that renders.
- Markup used once stays inline in its page as a local, non-exported function.
  Create a `components/` file only when it is reused or the page grows past
  readability.
- Presentational components take data via props and report via callbacks
  (`onRemove`, `onSelect`). They never fetch or mutate.

## Route components render, hooks think

```tsx
export function OrderDetailPage() {
  const page = useOrderDetailPage()
  return <>{/* JSX only */}</>
}
```

The page hook (`use-<page>-page.ts`) owns router state (`Route.useParams()`,
`Route.useSearch()`, `useNavigate`), queries and mutations, local UI state,
derived values and callbacks, and returns one object. The page component
holds no `useState`, `useEffect` or query. The route config owns params and
search validation, `beforeLoad` guards, the `loader` and (website) `head()`.

## Hooks

- `hooks/query/` holds every `useQuery` / `useMutation`; the page hook and
  pure `*-actions.ts` helpers stay at the `hooks/` root.
- No hand-rolled fetch in `useEffect`: use the project's data layer (`data-and-state.md`).
  No server data in a client store.
- Derive during render; reset state with a `key` on the entity id; store the id, not the object. External stores use
  `useSyncExternalStore`. Every effect cleans up.
- `use(promise)`: a stable promise (never created in render), a boundary above, no `try`. An update that suspends runs
  in a transition.
- `useMemo` / `useCallback` only when it is measurably needed or the value is
  a dependency of another hook / a memoised child.
- Floating promises get `void`: `onClick={() => { void navigate({ to: '/orders' }) }}`.
- `useEffectEvent` (19.2+, like `<Activity>`; `<ViewTransition>` is 19.3): declared at the top level, its function called
  only from effects or other Effect Events, never a dependency or a prop.
- One submit mechanism per form: `<form action>` (it resets uncontrolled fields) or an `onSubmit` handler.
- A handler over 50 ms is split and yields (`scheduler.yield()` where it exists, else a timeout).
- Single-flight actions (submit, OTP send, pay) guard on `isPending` **and**
  a ref, so a second tap during the request does nothing.

## Navigation

- `Link` / `useNavigate` from `@tanstack/react-router`, with typed `to` and
  `params`. Anything a user clicks to go to another page is a `<Link>` (a
  real `<a href>`), not a `div` or `button` with `navigate()`.
- URL state (tab, filter, page, sort) lives in search params, validated with
  `validateSearch` (zod) and read with `Route.useSearch()`.
- Redirect after a mutation from the page hook (`onSuccess`), never from a
  query hook.
- Guards live in `beforeLoad` (`throw redirect(...)`) on a layout route;
  missing data → `throw notFound()`.
- Cross-route hand-off of an object goes through a small store
  (`{ value, setValue, clear }`), not long search params. The receiving page
  redirects away when the store is empty.

## Website only (TanStack Start)

- No `window`, `document` or `localStorage` during render — only in effects
  and event handlers. Anything that differs between server and client
  (dates, random ids) must not cause a hydration mismatch.
- Server-only code (secrets, direct backend calls with private keys) lives in
  server functions (`createServerFn`); never import it from client code.
- One query client per request on the server.

## Edges

- Inline JSON in a script escapes `<`; a redirect target from input is validated after normalising.
- Numbers, money and dates go through the project's formatter (`project.md` names it).
- Deleted chunks after a deploy: one `vite:preloadError` listener reloads once per message (`sessionStorage`
  guard) and only then calls `preventDefault()`. Recommend that the host serves the HTML `no-cache`.

## Imports

Third-party, then the `@/…` alias, then relative (the formatter sorts).
Relative inside a feature, the alias across features and into shared code.
The HTTP library is imported only inside the API client.

## Never

- Class components, except one reusable error boundary (React has no hook for that). Default exports, except where a tool
  requires one.
- `console.log`, `debugger`, commented-out code.
- Inline `style={{}}` except for truly dynamic values (a computed width,
  a CSS variable); never `!important`.
- `dangerouslySetInnerHTML` with unsanitised data from outside the repo.
- Files over 500 lines — split by extracting hooks first, then components.
