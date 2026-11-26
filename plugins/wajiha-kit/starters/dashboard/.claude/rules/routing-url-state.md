---
paths:
  - 'src/routes/**'
  - 'src/router.tsx'
  - 'src/guards/**'
  - 'src/lib/list-search.ts'
  - 'src/hooks/use-list-search.ts'
  - 'src/utils/table-state.ts'
  - 'src/types/routes.ts'
  - 'src/features/**/validations/search.ts'
  - 'src/features/**/hooks/filter/**'
  - 'src/features/**/hooks/use-list-page.ts'
---

# Routing and URL state

The URL is the state of every list: page, page size, sort, search text and each
filter. That keeps a filtered view shareable, back/forward working and a reload safe.

- One zod schema per list in `validations/search.ts`, passed straight to
  `validateSearch`. Build it from `@/lib/list-search` (`pageSchema`,
  `pageSizeSchema`, `looseText`, `withFallback`): every field falls back on a bad
  value and has a default, so a broken shared link still opens the list.
- The router JSON-parses search values, so `?q=100553` arrives as a number and
  `?decimals=2` too. Free text goes through `looseText`; an enum that can look
  numeric needs a `z.preprocess` that turns the number back into a string.
- The route strips defaults: `search: { middlewares: [stripSearchParams(defaultXSearch)] }`.
- `loaderDeps` returns `toXListParams(search)` (only the fields the request uses);
  the loader **starts** the shared `queryOptions` fetch and does not wait for it
  (`void context.queryClient.query(...).catch(() => null)`), then loads the
  feature's locale. A detail route waits for existence, not freshness.
- Features read search with `getRouteApi('/_app/<x>/')`, never by importing the
  `Route` object. The route's `navigate` goes into `useListSearch` as `update`
  (see `hooks/filter/use-supplier-filters.ts`): it returns pagination, sorting,
  `setFilters` (page back to 1, `replace` while typing), `clear` and `hasFilters`.
- Write search with the functional form and reset `page` to 1 on any filter, sort
  or page-size change (`useListSearch` does it). Page index is 0-based in the
  table, 1-based in the URL; convert only in `utils/table-state.ts`.
- A page past the end (a shared link, or the last row deleted) is replaced by the
  last real page with `useClampPage`.
- Selection that must survive a reload (a tree node, a tab) is a search param too,
  not `useState`.
- Nav items and links take paths from the route tree: `StaticRoutePath` in
  `src/types/routes.ts`; a typo fails the typecheck. After adding a route file run
  `npm run routes` (or `npm run fix`).
- Every `_app` route calls `requirePermission(PERMS.x.view)` in `beforeLoad`.

Don't: no `useEffect` that copies search into state or back; no `window.location`
reads for anything the router owns; no logic or JSX beyond the container in a
route file. Every list schema has a test (numeric `q`, bad enum, empty URL).
