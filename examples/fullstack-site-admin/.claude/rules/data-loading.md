---
paths:
  - "src/routes/_site/**"
  - "src/router.tsx"
  - "src/features/**/queries/**"
  - "src/features/**/hooks/**"
  - "src/features/**/server/**"
  - "src/features/**/use-*.ts"
  - "src/shared/hooks/**"
  - "src/shared/server/**"
  - "src/shared/constants/query-keys.ts"
---

# Data loading: loaders, Query SSR, server functions, caching

Route loaders decide **what must be in the first HTML**. TanStack Query owns
the data and its cache. The SSR integration
(`@tanstack/react-router-ssr-query`) moves the server cache to the browser,
so nothing is fetched twice.

## One `queryOptions` per read, shared by loader and component

```ts
// features/website/products/queries/product.queries.ts
export const productQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: qk.products.detail(slug),
    queryFn: () => fetchProduct(slug),
    staleTime: 5 * 60_000,
  })
```

- Keys from `qk` only (`src/shared/constants/query-keys.ts`), grouped by
  domain with an `all` key; never an inline array.
- The loader and the component use the **same** options object; a different
  key or `staleTime` means a second request after hydration.
- Feature-only options live in the feature's `queries/`; options used by two
  features move to `src/shared/queries/<domain>.queries.ts`.

## Loaders

```ts
loader: async ({ context: { queryClient }, params }) => {
  const product = await queryClient.query(productQueryOptions(params.slug))
  void queryClient.query(relatedQueryOptions(params.slug)).catch(() => undefined)
  return { seo: toProductSeo(product) }
}
```

- **Await** what the page cannot render without: main content, anything
  `head()` needs, existence (`notFound()`), redirects. The component reads
  it with `useSuspenseQuery(productQueryOptions(slug))`.
- **Stream** secondary sections (related items, reviews): start without
  awaiting, swallow the rejection (an unhandled rejection is a server
  error), and render the section in `<Suspense>` with a same-size skeleton.
- Start independent awaited reads together (`Promise.all`); never await a
  list to then start a detail whose id you already have.
- A loader returns only what `head()` and the page need beyond the cache
  (a small `seo` object), never the whole payload again — it would be
  serialised twice.
- Loaders run in the browser on navigation: no secrets, no server-only
  imports. Privileged reads go through a server function used as `queryFn`.
- `queryClient.query()` is the current API (TanStack Query 5.102+);
  `ensureQueryData`, `fetchQuery` and `prefetchQuery` are deprecated there.
  On an older Query version use `ensureQueryData` until you upgrade.

## Reads in components

- Data that the loader awaited: `useSuspenseQuery`.
- Data that only appears after an interaction (search-as-you-type, a tab
  opened later): `useQuery` with `enabled` guards — it is not in the server
  HTML, so the page must look complete without it.
- No `useEffect` + fetch. Server data stays in the Query cache, never copied
  into Zustand or `useState`.

## Server functions (`createServerFn`)

- Use them for anything that needs a secret, a server-only SDK, the
  HttpOnly session cookie, or a backend the browser cannot call (CORS).
  Plain public reads from a CORS-enabled API can stay a normal service call.
- File naming: `<entity>.functions.ts` exports the `createServerFn`
  wrappers (safe to import anywhere, statically — never `await import()`);
  `<entity>.server.ts` holds server-only helpers, imported only inside
  handlers; schemas and types in plain `.ts`.
- Reads are `GET`, writes are `POST`. Every input passes a zod schema in
  `.validator(schema)`; the handler trusts only validated `data`.
- Authorise inside the handler, every time: a server function is a public
  HTTP endpoint, whether or not a page links to it.
- Return plain serialisable data shaped for the UI. Never return secrets,
  raw backend errors, tokens or other users' data.
- Throw `notFound()` / `redirect()` from a handler when the page should
  react; throw an error with a safe message otherwise.
- See the `web-server-fn` skill.

## Mutations

- `useMutation` in `hooks/query/use-<verb>-<entity>.ts`; call a server
  function through `useServerFn(fn)`, or a client service.
- `onSuccess` returns `queryClient.invalidateQueries({ queryKey: qk.x.all })`
  so the button stays pending until fresh data is in. Loader-only data (no
  Query) is refreshed with `router.invalidate()`; sign-in/out needs both.
- Feedback (toasts) is centralised (`api-layer.md`); hooks pass `meta`, never
  call `toast()` themselves. Navigation after success is the page hook's job.
- Single-flight: guard on `isPending` **and** a ref.

## Caching

- `staleTime` per domain: catalogue/content minutes, account data short,
  anything money-related `0`. Set it on the options, not ad hoc.
- With `defaultPreload: 'intent'`, keep `defaultPreloadStaleTime: 0` so Query
  (not the router) decides freshness.
- Personalised responses (anything that depends on a cookie or the session):
  `headers: () => ({ 'Cache-Control': 'private, no-store' })` on the route and
  `setResponseHeaders` in the server function. Public pages may get a short
  `s-maxage` only if the HTML does not vary by cookie.
- On sign-out: cancel and remove the account's queries
  (`queryClient.removeQueries({ queryKey: qk.account.all })`), clear stores,
  then `router.invalidate()`.

## Never

- A module-level `QueryClient` (cross-request data leak).
- Two `QueryClient`s, or dehydrating by hand next to the integration.
- Secrets or tokens in query keys, loader data or search params.
- A query that the loader awaited also fetched in an effect.
