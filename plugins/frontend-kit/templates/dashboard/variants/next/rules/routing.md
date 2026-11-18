---
paths:
  - "src/app/**"
  - "app/**"
  - "src/proxy.ts"
  - "proxy.ts"
  - "src/guards/**"
  - "src/features/**/validations/search.ts"
  - "src/lib/list-search.ts"
  - "src/features/**/hooks/use-*-page.ts"
---

# Routing (Next.js App Router, client-rendered admin)

Pages are thin. A `page.tsx` default-exports a component that renders one container; the permission check and the
page logic live in the container's page hook. Skill: `dash-create-route` (Next.js reference).

## Layout groups

| Group      | Guard                                              | Use for                               |
| ---------- | -------------------------------------------------- | ------------------------------------- |
| `(auth)/`  | `<RequireGuest>` in its layout                     | login, forgot password                |
| `(app)/`   | `<RequireAuth>` in its layout + per-page permission| everything behind login               |
| `(errors)/`| none                                               | 401 / 403 / 500 pages                 |

Route groups (`(app)`) do not appear in the URL. `not-found.tsx`, `error.tsx` and `global-error.tsx` sit at the root of
`app/`. A new audience is a new group with its own layout, not a flag inside `(app)`.

## Server and client

- The kit's session is browser-held (access token in memory, refresh token in `sessionStorage`, see `api-layer.md`),
  so the **server cannot know who the user is**. Therefore: no server-side data fetching for signed-in pages, and
  containers are Client Components (`'use client'`). The server renders the shell; the data loads in the browser
  through TanStack Query with the same `queryOptions` objects as everywhere else.
- If the backend sets an HttpOnly session cookie instead, say so in `project.md`; then server prefetch
  (`HydrationBoundary` + `dehydrate`) becomes possible and this section changes. Do not mix the two models.
- `src/app/layout.tsx` mounts `<Providers>` (QueryClient created once per browser tab with `useState`, i18n, Toaster).
  `<html lang dir>` comes from the language source in `project.md`.

## Guards (there is no `beforeLoad`)

Two layers, and neither is the real check (the backend decides):

1. `src/proxy.ts` (Next 16; `middleware.ts` before that). Optimistic only: no session cookie or marker on a protected
   path → redirect to `/login?redirect=<path>`. It cannot see permissions or a browser-held token. Always set a
   `matcher` that excludes `_next/static`, `_next/image`, the favicon and `/api`; without it the proxy runs for every
   asset. Server Functions are POSTs to their page, so never treat the proxy as their only protection.
2. `(app)/layout.tsx` renders `<RequireAuth>`: it waits for `bootstrapSession()`, shows the shell's loading state, and
   redirects to `/login?redirect=` when there is no session. Each page container renders
   `<RequirePermission perm={PERMS.x.view}>` (or its hook returns the state) and sends a missing permission to `/403`.
   Guards read state with `getState()` for decisions and selectors for rendering; never decide in render from a stale read.

`redirect` targets are checked to be same-app paths before use (login sends the user back to `redirect`).

## Search params are the state of a list

Page, page size, sort, search text and every filter live in the URL: shareable, back/forward works, survives reload.

- One zod schema per list in `features/<group>/<entity>/validations/search.ts`, same shape as in every other
  dashboard: every field has `.catch()` and a default, `page` and `pageSize` go through `z.coerce`.
- Next hands you **strings only** (`URLSearchParams`): there is no JSON parsing, so `?q=100553` stays `"100553"`
  and the `looseText` preprocess is not needed. A multi-select filter is repeated keys (`?status=a&status=b`):
  read it with `getAll`.
- `src/lib/list-search.ts` owns the glue, so page hooks look the same as in the other variants:
  `useListSearch(schema)` parses `useSearchParams()` (memoised on `searchParams.toString()`) into the typed search, and
  `useSetListSearch(schema)` returns `(update, { replace? }) => void` that merges onto the current search, strips
  values equal to the schema defaults, and calls `router.replace` / `router.push` with `{ scroll: false }`.
  Feature code never touches `URLSearchParams` or `useRouter` for search.
- Reset `page` to 1 whenever a filter, the search text, the sort or the page size changes. Text search writes with
  `replace` after a 400 ms debounce.
- `useSearchParams` needs a `<Suspense>` boundary above it for a prerendered route (the production build fails
  without one): the page wraps its container in `<Suspense fallback={<ListSkeleton />}>`.
- Keep ids and enums as strings; large objects never travel in the URL.

## Data loading

- No loaders. The container's hook calls `useQuery(xListQueryOptions(params))` with
  `placeholderData: keepPreviousData`, so changing a filter keeps the old rows on screen.
- Detail and edit pages use `useSuspenseQuery(xDetailQueryOptions(id))` inside a `<Suspense>` plus an error boundary
  (`error.tsx` next to the page, or `<Wrapper>`); a 404 from the backend calls `notFound()` from `next/navigation`.
- Warm a likely next page on intent: `queryClient.prefetchQuery(...)` from the row link's `onMouseEnter` /
  `onFocus`. Code is prefetched by `<Link>` itself.
- The feature's locale bundle loads in the container (a `useFeatureLocale('app/users')` hook that suspends), so the
  page never flashes keys.

## Params and navigation

- Folder names are the entity: `[userId]`, never `[id]`. `params` is a Promise in Server Components; in a Client
  Component read it with `useParams<{ userId: string }>()` and validate it (zod) before use.
- Links are `<Link href>` from `next/link`. Build hrefs with the project's typed route helper (`routes.users.detail(id)`
  in `constants/routes.ts`), never by string concatenation in a component. Enable `typedRoutes` when the project's Next
  version supports it, and prefer it over a hand-written helper.
- `useRouter().push` for actions, `replace` for search-param writes; never `window.location` for in-app moves.

## Don't

- No logic, fetching or JSX beyond the container in a `page.tsx`.
- No `useEffect` that copies search params into state (or back).
- No `'use client'` on `page.tsx` or `layout.tsx` just to read a hook: put the hook in a container instead.
- No secrets in `NEXT_PUBLIC_*`; no reading `.env` from a Client Component.
- No data fetching in `proxy.ts`.
