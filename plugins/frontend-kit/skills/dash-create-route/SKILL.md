---
name: dash-create-route
description: "Dashboard profile: add a TanStack Router file route — a list, detail, create or edit page, a new layout group, or a guarded section — with a permission guard, a typed zod search schema, a loader that prefetches through the query client, and the sidebar nav entry. Use when the user asks to add a page, route, screen, URL, tab-in-the-URL, a new section in the sidebar, or to guard a route by role or permission."
---

# Dashboard: create a route

Rules this follows: `.claude/rules/routing.md`, `.claude/rules/permissions.md`.
Full examples: `references/route-examples.md`.

## 0. Decide

- Which group: `_app/` (signed in, the normal case), `_auth/` (guest only) or
  `(errors)/`. A new audience gets a new group, see the reference.
- Which page, under `src/routes/_app/<entity>/`: list `index.tsx`, create
  `new.tsx`, detail `$<entity>Id/index.tsx`, edit `$<entity>Id/edit.tsx`.
  Detail and edit as siblings in a folder (no `$<entity>Id.tsx`), otherwise
  edit becomes a child of detail and only renders through an `<Outlet />`.
- Which permission guards it. Missing from `PERMS`? Ask for the backend's exact
  string; do not invent one.
- Which search params the page owns (list: page, pageSize, sort, q, filters;
  detail: `tab`). Each becomes a schema field with `.catch()` and a default.

## 1. Order: route stub, generate, container

The route imports a default-exported container from
`@/features/<group>/<entity>` (list) or `.../pages/<page>` (other pages), and the
container calls `getRouteApi('/_app/<entity>/')`, which only typechecks once the
route exists in `src/routeTree.gen.ts`. So:

1. Create the route file with a placeholder component (or the search schema and
   guard only).
2. `npm run routes:generate` (or `npm run dev` once) so the tree knows the route.
3. Build the container with `dash-create-table` (lists), `dash-create-crud`
   (create/edit), `dash-create-detail` (detail) or `dash-create-settings-form`,
   then replace the placeholder.

## 2. Search schema (pages with search params)

`features/<group>/<entity>/validations/search.ts`:

```ts
import { z } from 'zod';
import { looseText } from '@/lib/list-search';

export const userSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce.number().pipe(z.literal([10, 20, 50])).catch(20).default(20),
  sort: z.string().catch('').default(''),
  q: looseText.catch('').default(''),
});
export type UserSearch = z.infer<typeof userSearchSchema>;
export const defaultUserSearch: UserSearch = userSearchSchema.parse({});
```

`looseText` is the shared preprocess from `routing.md` (the router parses `?q=100553` into a number; this puts it
back to a string). Filter fields come from `dash-create-filter-bar`.

## 3. Route file

```tsx
// src/routes/_app/users/index.tsx
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import UsersListContainer from '@/features/app/users';
import { usersListQueryOptions } from '@/features/app/users/hooks/query/use-users-list';
import { toUserListParams } from '@/features/app/users/utils/list-params';
import { defaultUserSearch, userSearchSchema } from '@/features/app/users/validations/search';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_app/users/')({
  validateSearch: userSearchSchema,
  search: { middlewares: [stripSearchParams(defaultUserSearch)] },
  beforeLoad: () => {
    requirePermission(PERMS.users.view);
  },
  loaderDeps: ({ search }) => toUserListParams(search),
  loader: async ({ context, deps }) => {
    // Start the list fetch without blocking: the table keeps the previous page
    // on screen instead of the route going pending on every filter change.
    void context.queryClient.prefetchQuery(usersListQueryOptions(deps));
    await loadFeatureLocale('app/users');
  },
  component: UsersListContainer,
});
```

Detail and edit routes `await context.queryClient.ensureQueryData(...)` and
turn a 404 into `notFound()`; see the reference.

## 4. Reading the route from the feature

Never import `Route` into a feature. In the page hook:

```ts
const routeApi = getRouteApi('/_app/users/');
const search = routeApi.useSearch();
const navigate = routeApi.useNavigate();
```

## 5. Nav entry (sidebar pages only)

Add an item to the nav config with `labelKey`, icon and the same `permission`
as the guard, plus the `nav.<entity>` key in both global locale files.

## 6. Checklist

- [ ] `beforeLoad` guard with the right `PERMS` entry (none only for `_auth/` and errors)
- [ ] `validateSearch` with the zod schema; defaults stripped from the URL
- [ ] `loaderDeps` picks only what the fetch uses; loader prefetches + loads the locale
- [ ] No logic or JSX beyond the container in the route file
- [ ] `src/routeTree.gen.ts` regenerated (`npm run routes:generate`, `dev` or `build`), never edited
- [ ] Strings in both `ar` and `en`; page checked in RTL and LTR
- [ ] Tests: schema unit test (bad values fall back, defaults apply), one
      integration test that a missing permission lands on `/403`, the page in
      the e2e a11y list
- [ ] `verify` skill passes

## Don't

- Don't use `useState` + `useEffect` to mirror search params.
- Don't build URLs as strings; use `<Link to params search>` / `navigate`.
- Don't put large objects in the URL; use an ephemeral feature store.
