---
name: tanstack-query-key-conventions
description: Query and mutation key conventions — every key comes from the project's one query-key factory, grouped by domain so one `all` key invalidates a family. Use whenever writing or reviewing useQuery, useSuspenseQuery, useMutation, useInfiniteQuery, queryOptions, invalidateQueries, setQueryData, prefetchQuery, ensureQueryData or removeQueries, or when tempted to write an inline key array.
---

# Query keys

Only for a project with TanStack Query: with another data layer keep its own cache keys, and don't install Query.

All keys come from one factory (its name and file are in `CLAUDE.md`, e.g.
`qk` in `constants/query-keys.ts`). No inline arrays (`['orders']`,
`['getProducts']`) anywhere else.

## Shape

One entry per backend domain. `all` is the prefix of every key in the family,
so one invalidation clears it:

```ts
export const qk = {
  orders: {
    all: ['orders'] as const,
    list: (params: OrderListParams) => ['orders', 'list', params] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  profile: {
    all: ['profile'] as const,
    me: () => ['profile', 'me'] as const,
  },
} as const
```

- Index 0 is the domain (`'orders'`, `'profile'`, `'users'`).
- Then a role segment (`'detail'`, `'list'`, `'me'`, `'children'`), then the
  inputs (id, params object).
- Params are plain JSON (strings, numbers, booleans, plain objects, arrays).
  Convert `Date` to ISO strings first. Reference stability doesn't matter —
  TanStack hashes by content. Table state (page, sort, filters) goes in the
  params object, taken from the validated search params.
- Add the key when you add the endpoint (the endpoint constants file).

## Using them

```ts
export const orderQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: qk.orders.detail(orderId),
    queryFn: () => fetchOrder(orderId),
  })

useQuery({ ...orderQueryOptions(orderId), enabled: Boolean(orderId) })

useMutation({
  mutationFn: archiveOrder,
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: qk.orders.all })
  },
})
```

- A route `loader` and the component share the same `queryOptions` so the
  key can't drift (`context.queryClient.query({ ...orderQueryOptions(id), staleTime: 'static' })`;
  `ensureQueryData` below Query 5.102). `'static'` only at that call, never on the shared options.
- Mutations invalidate their domain's `all` (and the specific detail when
  that is enough) in `onSuccess` in the query hook.
- Session-scoped data is cleared on sign-out by the project's sign-out
  function — don't add per-feature cleanup.
- `setQueryData` only with a key from the factory and the exact cached type.
- `mutationKey` is optional; when needed use `[...qk.<domain>.all, '<verb>']`.
- Website (TanStack Start): the query client is created per request on the
  server — never a module-level client shared between requests.

## Never

- Inline key arrays or string names outside the factory file.
- Two factories for the same domain.
- Keys that include whole objects from a store when an id is enough.
