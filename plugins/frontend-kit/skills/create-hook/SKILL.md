---
name: create-hook
description: Create a React hook — a custom hook, a data-fetching hook (TanStack Query useQuery/useMutation over a service), a page orchestration hook (use-<page>-page.ts) or a small utility hook — with correct location, keys, guards and tests. Use whenever the user asks to create, write, add or extract a hook, or when a route component or container is accumulating logic.
---

# Create hook

File `use-<thing>.ts`, named export `useX`. Location by ownership: `hooks/`
of the page or feature; the shared hooks folder (utility) or shared query
hooks folder (server state) once a second feature uses it — `CLAUDE.md` names
the folders. Pure helpers are not hooks — `hooks/<x>-actions.ts` or `utils/`.

## 1. Query / mutation hooks (`hooks/query/`)

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qk } from '@/<shared>/constants/query-keys'
import { archiveOrder, fetchOrder } from '../services/orders.service'

export function useOrder(orderId: string | undefined) {
  return useQuery({
    queryKey: qk.orders.detail(orderId ?? ''),
    queryFn: () => fetchOrder(orderId ?? ''),
    enabled: Boolean(orderId),
  })
}

export function useArchiveOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: archiveOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qk.orders.all })
    },
  })
}
```

Keys from the project's factory (`tanstack-query-key-conventions`). If the API
client toasts errors: no toasts, no `onError` here. No navigation — the page
hook navigates. Session-only queries also check the session
(`enabled: isAuthed && Boolean(id)`); public queries never do.

Export the `queryOptions(...)` too when a route `loader` needs the same query
(`context.queryClient.query({ ...orderQueryOptions(id), staleTime: 'static' })`;
`ensureQueryData` below Query 5.102). `'static'` only at that call, never on the shared options.

## 2. Page hooks (`hooks/use-<page>-page.ts`)

Own everything the route component needs:

```ts
const route = getRouteApi('/orders/$orderId')

export function useOrderDetailPage() {
  const { orderId } = route.useParams()
  const search = route.useSearch()
  const navigate = useNavigate()
  const order = useOrder(orderId)
  const archive = useArchiveOrder()
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null)

  const selectedLine = useMemo(
    () => order.data?.lines?.find((line) => line.id === selectedLineId) ?? null,
    [order.data, selectedLineId],
  )

  function archiveAndLeave() {
    if (archive.isPending) {
      return
    }
    archive.mutate(orderId, { onSuccess: () => { void navigate({ to: '/orders' }) } })
  }

  return { order, search, selectedLine, setSelectedLineId, archiveAndLeave, isArchiving: archive.isPending }
}
```

URL params and search are validated in the route (`params.parse`,
`validateSearch` with zod); missing / malformed → `notFound()` or a redirect.
Return one object.

Website (TanStack Start): data the first paint needs comes from the route
`loader`; the page hook reads it with `useSuspenseQuery` on the same options.
Dashboard (Vite + TanStack Router): `useQuery` is fine; the loader may
prefetch.

## 3. Utility hooks

Debounce, media queries, drag-scroll, apply theme/language.
Unconditional hook calls, full dependency arrays, cleanup in effects, never
fetch in `useEffect`. Website: browser APIs only inside effects (SSR).

## Rules

- Braces on every arrow body that is a statement (`curly` is an error).
- `void` floating promises. `import type` for types.
- Test: `renderHook` + MSW for query hooks; `renderHook` with a router
  wrapper for page hooks that use the router.
- `npm run typecheck && npm run lint`.
