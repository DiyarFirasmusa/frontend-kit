# Route examples (Next.js App Router, client-rendered admin)

Use this file when `stack.framework` in `.claude/frontend-kit.json` is `Next.js`. Rules: `.claude/rules/routing.md`
(Next.js version), `.claude/rules/permissions.md`. Folder names below assume the code lives in `src/`; drop the `src/`
when the project's `app/` is at the root. Check the snippets against the installed Next major.

## The page: thin, default export, one container

```tsx
// src/app/(app)/users/page.tsx
import { Suspense } from 'react';
import { ListSkeleton } from '@/components/wrappers/list-skeleton';
import { UsersListContainer } from '@/features/app/users';

export default function UsersPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <UsersListContainer />
    </Suspense>
  );
}
```

`page.tsx` stays a Server Component: no hooks, no `'use client'`. The `Suspense` is required because the container
reads `useSearchParams` (a production build fails without it on a prerendered route).

## Detail and edit: sibling folders

```text
src/app/(app)/users/
├── page.tsx                  → list
├── new/page.tsx              → create
└── [userId]/
    ├── page.tsx              → detail
    └── edit/page.tsx         → edit
```

Pages for `[userId]` receive `params` as a Promise. Do not read it in the page: render the container and let it call
`useParams<{ userId: string }>()` (Client Component), then validate it with zod before use.

## The container: guard + hook

```tsx
// src/features/app/users/index.tsx
'use client';

import { RequirePermission } from '@/guards/require-permission';
import { PERMS } from '@/constants/permissions';
import { useUsersListPage } from './hooks/use-list-page';

export function UsersListContainer() {
  return (
    <RequirePermission permission={PERMS.users.view}>
      <UsersList />
    </RequirePermission>
  );
}

function UsersList() {
  const page = useUsersListPage();
  // JSX only: table, filter bar, dialogs bound to `page`
}
```

A missing permission redirects to `/403` (inside `<RequirePermission>`, never in render of the table). The check is
only for the user's benefit; the backend still decides.

## Search schema and the glue

The schema file is the same as in the other dashboard variants (`features/<group>/<entity>/validations/search.ts`),
without `looseText`: Next gives strings only.

```ts
// src/lib/list-search.ts
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { z } from 'zod';

type SearchSchema<T> = z.ZodType<T, unknown>;

function toObject(params: URLSearchParams): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key);
    out[key] = all.length > 1 ? all : (all[0] ?? '');
  }
  return out;
}

export function useListSearch<T>(schema: SearchSchema<T>): T {
  const params = useSearchParams();
  const key = params.toString();
  // `key` is the stable identity of `params`, so the parse reruns only when the query string changes
  return useMemo(() => schema.parse(toObject(new URLSearchParams(key))), [schema, key]);
}

export function useSetListSearch<T extends Record<string, unknown>>(schema: SearchSchema<T>, defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useListSearch(schema);
  return useCallback(
    (update: Partial<T> | ((prev: T) => T), options?: { replace?: boolean }) => {
      const next = typeof update === 'function' ? update(current) : { ...current, ...update };
      const qs = new URLSearchParams();
      for (const [name, value] of Object.entries(next)) {
        if (JSON.stringify(value) === JSON.stringify(defaults[name])) continue; // defaults stay out of the URL
        for (const item of Array.isArray(value) ? value : [value]) qs.append(name, String(item));
      }
      const href = qs.size ? `${pathname}?${qs.toString()}` : pathname;
      if (options?.replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [current, defaults, pathname, router],
  );
}
```

The page hook then reads
`const search = useListSearch(userSearchSchema)` and writes
`setSearch((prev) => ({ ...prev, status, page: 1 }))`: the same shape as `getRouteApi(...).useSearch()` /
`useNavigate()` in the TanStack variants.

If the project already uses `nuqs` or a similar library for search params, keep using it and keep the schema as the
single source of the defaults; do not add a second mechanism.

## Guards

`src/proxy.ts` (optimistic cookie check, `matcher` excluding assets), `(auth)/layout.tsx` with `<RequireGuest>`,
`(app)/layout.tsx` with `<RequireAuth>`. See `routing.md` for what each layer can and cannot know.

```ts
// src/proxy.ts
import { NextResponse, type NextRequest } from 'next/server';

const SESSION_MARKER = 'session'; // a non-sensitive marker cookie set at login, name from project.md

export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_MARKER)) return NextResponse.next();
  const url = request.nextUrl.clone(); // keeps the basePath
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  // End every excluded segment with (?:/|$), or `api` also skips /api-keys. `brand/` and `fonts/` stand for the folders
  // of the project's public/. Never exclude "anything with a dot": /users/john.doe is a page.
  matcher: ['/((?!(?:login|forgot-password|403|api)(?:/|$)|_next/static/|_next/image|favicon\\.ico$|robots\\.txt$|brand/|fonts/).*)'],
};
```

Test the matcher with a page that shares a prefix with each exclusion (`/api-keys`, `/login-history`) and with one
public asset.

When the session is only in browser memory (no marker cookie), leave the proxy out and let `<RequireAuth>` do the work;
do not invent a cookie just to have a proxy.

## Not found and errors

- 404 from the backend on a detail page: `useSuspenseQuery` throws before the component runs, so the `queryFn` returns
  `null` for a 404 (the request passes `silentErrorStatuses: [404]`) and the container calls `notFound()` from
  `next/navigation` when the data is `null`. It renders the nearest `not-found.tsx`; the HTTP status stays 200.
- `error.tsx` next to a route segment for a failed page (`retry` refetches on 16.3+; `reset` only clears the state);
  `global-error.tsx` for a broken root layout, with its own `<html>`, `<body>` and styles.
- `/403` is a normal page under `(errors)/403/page.tsx`, rendered inside the signed-in shell.

## Nav entry

Same as the other variants: an item in the nav config with `labelKey`, icon, `href` and the same `permission` as the
page, plus `nav.<entity>` in both locale files.
