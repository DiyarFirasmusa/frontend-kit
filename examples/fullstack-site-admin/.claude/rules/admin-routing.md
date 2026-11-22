---
paths:
  - "src/routes/admin/**"
  - "src/router.tsx"
  - "src/admin/guards/**"
  - "src/admin/features/**/validations/search.ts"
  - "src/admin/lib/list-search.ts"
  - "src/admin/features/**/hooks/use-*-page.ts"
---

# Routing (TanStack Router, file routes)

Routes are thin. A route file holds the guard, the search schema, the loader
and the component wiring. Page logic lives in the feature's page hook.
Skill: `dash-create-route`.

## Layout groups

| Group        | Guard                                   | Use for                              |
| ------------ | --------------------------------------- | ------------------------------------ |
| `_auth/`     | `requireGuest()`                        | login, forgot password               |
| `_app/`      | `requireAuth()` + per-route permission  | everything behind login              |
| `(errors)/`  | none                                    | 401 / 403 / 404 / 500                |

Each group's `route.tsx` sets `beforeLoad`, the layout, `errorComponent` and
`pendingComponent`. A new audience is a new group, not a flag inside `_app/`.

## Router context

The root route is `createRootRouteWithContext<RouterContext>()` with
`{ queryClient }`, so loaders prefetch through the same cache the components
read. `src/router.tsx` creates the router once and registers its type:

```ts
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
```

`src/routeTree.gen.ts` is generated while `npm run dev` runs. Never edit it;
if it is stale, run the dev server or the build.

## Search params are the state of a list

Page, page size, sort, search text and every filter live in the URL. That makes
a filtered view shareable, keeps back/forward working and survives a reload.

- One zod schema per list in `features/<group>/<entity>/validations/search.ts`,
  passed straight to `validateSearch` (zod 4 is a Standard Schema; no adapter).
- Every field has `.catch()` (a bad value in a shared link falls back instead
  of throwing) and a default, so links can omit it.
- Strip defaults from the URL with `stripSearchParams(defaultXSearch)`.
- Keep ids and enums as strings in the URL; numbers through `z.coerce` only
  when the schema owns them (`page`, `pageSize`).
- The feature reads search with `getRouteApi('<route id>')` — never import the
  `Route` object into a feature (circular import, breaks code splitting).

```ts
export const userSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce.number().pipe(z.literal([10, 20, 50])).catch(20).default(20),
  sort: z.string().catch('').default(''),
  q: z.string().trim().catch('').default(''),
  status: z.enum(['all', 'active', 'disabled']).catch('all').default('all'),
});
export type UserSearch = z.infer<typeof userSearchSchema>;
export const defaultUserSearch: UserSearch = userSearchSchema.parse({});
```

Writing search: always the functional form, and reset `page` to 1 whenever a
filter, the search text, the sort or the page size changes:

```ts
void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) });
```

Text search writes with `replace: true` after a 400 ms debounce so typing does
not fill the history.

## Loaders

- `loaderDeps` picks only the search fields the fetch uses; the loader reruns
  when they change.
- List routes **start** the fetch and do not wait for it:
  `void context.queryClient.query(xListQueryOptions(params)).catch(() => undefined)`. The table
  keeps the previous page on screen (`placeholderData: keepPreviousData`)
  instead of the route going pending on every filter change.
- Detail and edit routes **wait for existence, not freshness**:
  `await context.queryClient.query({ ...xDetailQueryOptions(id), staleTime: 'static' })`, then the page reads the same
  `queryOptions` with `useQuery` / `useSuspenseQuery`, which refetches stale data in the background. Pass `'static'` only
  at this call: on the shared options it stops invalidation. Query below 5.102: `ensureQueryData` / `prefetchQuery`.
- Independent reads start together (`Promise.all`), never one after another.
- Loaders also load the feature's locale bundle so the page never flashes keys.
- `queryOptions` objects live in the feature's `hooks/query/` and are shared by
  the loader and the hook, so the key and fetcher can never drift apart.

## Guards

- `beforeLoad` only. `requireAuth()` redirects to `/login` with
  `search: { redirect: location.href }`; login sends the user back there,
  after checking it is a same-app path (`safeRedirect`).
- `requirePermission(PERMS.x.view)` on every `_app/` route; missing permission
  redirects to `/403` (`admin-permissions.md`).
- Guards read state with `getState()` (no hooks in `beforeLoad`).

## Deploys, chunks and speed

- A tab that outlives a deploy asks for deleted chunks. `lazyRouteComponent` reloads once by itself; a hand-written
  `import()` does not, so register the `vite:preloadError` listener of `react.md` at start.
- Charts, editors and maps load on demand inside their route. Measure speed on the built app, never in dev.

## Params and navigation

- Path params are named after the entity: `$userId`, never `$id`.
- Containers stay router-agnostic where it helps testing: a route component
  may read params and pass `userId` / `onBack` as props.
- Links use `<Link to="/users/$userId" params={{ userId }}>`; never build URL
  strings by hand.
- Large objects never travel in the URL; use an ephemeral feature store.


## Search params: what the router really hands you

TanStack Router JSON-parses every search value before your schema sees it, so `?q=100553` arrives as the **number**
100553 and `?featured=true` as a boolean; `.catch()` then silently resets them. Therefore:

- Free text and ids go through a `looseText` preprocess (`src/admin/lib/list-search.ts`) that turns numbers and booleans
  back into strings:

```ts
export const looseText = z.preprocess(
  (value) => (typeof value === 'number' || typeof value === 'boolean' ? String(value) : value),
  z.string().trim(),
);
// q: looseText.catch('').default('')
```

- Multi-select filters are arrays in the URL (`status=["pending","confirmed"]`). Either accept that encoding and
  schema it with `z.array(...)`, or pick comma strings and a custom `parseSearch`/`stringifySearch` for the whole
  router. Pick one per project (write it in `project.md`); never mix.
- Every list schema has a test: a numeric `q`, an unknown enum value, a missing field and a shared link with the
  default values all parse to a valid search.

## Don't

- No logic, fetching or JSX beyond the container in a route file.
- No `useEffect` that syncs search params into state (or back).
- No untyped `window.location` reads for anything the router owns.
