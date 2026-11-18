---
paths:
  - "src/**/*.{ts,tsx}"
---

# React + TypeScript

React 19, strict TypeScript, TanStack Router (file routes), TanStack Query.
Website (TanStack Start): pages render on the server, then hydrate. Dashboard
(Vite + TanStack Router, or TanStack Start in SPA mode): a client-only SPA. No React
Server Components, no `'use client'`, no Next.js imports in either. The dashboard's
Next.js variant is the exception: a client-rendered App Router where containers carry
`'use client'` and the variant's `routing.md` says where Next imports are allowed.

## TypeScript

- Strict. Never `any` — use `unknown` and narrow. Never `@ts-ignore` /
  `@ts-expect-error`; fix the type.
- Type-only imports use `import type`.
- `interface` for object shapes, `type` for unions and aliases.
- Backend shapes come from the generated API types (never hand-edit).
  Fields stay exactly as the API sends them.
- Enum-like values: `const X = { … } as const` + a union type. Config
  objects: `as const satisfies T`.
- Avoid non-null `!`; check and narrow instead.

## Components

- Function components only, props typed with an interface above the component.
- Every component is a **named** export, one exported component per file.
  Route files export `Route` (TanStack Router) and nothing else that renders.
- Markup used once stays inline in its page as a local, non-exported function.
  Create a `components/` file only when it is reused or the page grows past
  readability.
- Presentational components take data via props and report via callbacks
  (`onRemove`, `onSelect`). They never fetch or mutate.

## Route components render, hooks think

```tsx
export const Route = createFileRoute('/orders/$orderId')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(orderQueryOptions(params.orderId)),
  component: OrderDetailPage,
})

function OrderDetailPage() {
  const { t } = useTranslation()
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
- No `useEffect` for fetching — TanStack Query (and route loaders) only. No
  server data in Zustand.
- Zustand: always subscribe with a selector (`useSettingsStore((state) => state.language)`).
- `useMemo` / `useCallback` only when it is measurably needed or the value is
  a dependency of another hook / a memoised child.
- Floating promises get `void`: `onClick={() => { void navigate({ to: '/orders' }) }}`.
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

## Imports

Third-party, then the `@/…` alias, then relative (the formatter sorts).
Relative inside a feature, the alias across features and into shared code.
The HTTP library is imported only inside the API client.

## Never

- Class components, default exports (except where a tool requires one).
- `console.log`, `debugger`, commented-out code.
- Inline `style={{}}` except for truly dynamic values (a computed width,
  a CSS variable); never `!important`.
- `dangerouslySetInnerHTML` with backend data.
- Files over 500 lines — split by extracting hooks first, then components.
