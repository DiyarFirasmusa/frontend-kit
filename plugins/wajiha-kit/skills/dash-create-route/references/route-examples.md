# Route examples (TanStack Router, file routes)

Checked against TanStack Router v1 docs: `createRootRouteWithContext`,
`validateSearch` with a zod 4 schema directly, `stripSearchParams`,
`loaderDeps`, `getRouteApi(...).useSearch()` / `.useNavigate()`, `redirect`,
`notFound`.

## Vite plugin

The router plugin goes **before** the React plugin; it writes `src/routeTree.gen.ts`.

```ts
// vite.config.ts
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react()],
});
```

## Router and root route

```ts
// src/router.tsx
import { createRouter } from '@tanstack/react-router';
import { queryClient } from '@/lib/query-client';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    // TanStack Query owns freshness; the router must not cache preloads on top.
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
```

```tsx
// src/routes/__root.tsx
import type { QueryClient } from '@tanstack/react-query';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { NotFoundView } from '@/features/fallback/not-found';
import { RootErrorView } from '@/features/fallback/root-error';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  errorComponent: RootErrorView,
  notFoundComponent: NotFoundView,
});
```

## Guards

```ts
// src/guards/route-guards.ts
import { redirect } from '@tanstack/react-router';
import type { Permission } from '@/constants/permissions';
import { useAuthStore } from '@/store/auth-store';
import { hasPermission } from '@/store/permission-store';

export function requireAuth(returnTo: string): void {
  if (!useAuthStore.getState().accessToken) {
    throw redirect({ to: '/login', search: { redirect: returnTo } });
  }
}

export function requireGuest(): void {
  if (useAuthStore.getState().accessToken) {
    throw redirect({ to: '/' });
  }
}

export function requirePermission(permission: Permission): void {
  if (!hasPermission(permission)) {
    throw redirect({ to: '/403' });
  }
}
```

The login route's schema has `redirect: z.string().catch('').default('')`, and
login only follows `safeRedirect(redirect, window.location.origin)` (`security.md`): a leading-slash check alone lets
`/.//evil.com` through.

## Layout group

```tsx
// src/routes/_app/route.tsx
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { RouteErrorView } from '@/features/fallback/route-error';
import { PageLoading } from '@/features/fallback/page-loading';
import { requireAuth } from '@/guards/route-guards';
import { AppLayout } from '@/layout/app';

function AppShell() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export const Route = createFileRoute('/_app')({
  beforeLoad: ({ location }) => {
    requireAuth(location.href);
  },
  component: AppShell,
  // Inside the shell, so a crashed page keeps the sidebar and top bar.
  errorComponent: RouteErrorView,
  pendingComponent: PageLoading,
});
```

## Detail route (waits for data, 404 → notFound)

```tsx
// src/routes/_app/users/$userId/index.tsx
import { createFileRoute, notFound } from '@tanstack/react-router';
import { getErrorStatus } from '@/api/error/api-error';
import { PERMS } from '@/constants/permissions';
import { UserDetailContainer } from '@/features/app/users/pages/detail';
import { userDetailQueryOptions } from '@/features/app/users/pages/detail/hooks/query/use-user-detail';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_app/users/$userId/')({
  beforeLoad: () => {
    requirePermission(PERMS.users.view);
  },
  loader: async ({ context, params }) => {
    await loadFeatureLocale('app/users');
    try {
      await context.queryClient.query({ ...userDetailQueryOptions(params.userId), staleTime: 'static' });
    } catch (error: unknown) {
      if (getErrorStatus(error) === 404) {
        throw notFound();
      }
      throw error;
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { userId } = Route.useParams();
  return <UserDetailContainer userId={userId} />;
}
```

`getErrorStatus(error: unknown): number | undefined` lives in the API layer, so
route files never import `axios`. A 404 here renders the route's
`notFoundComponent` instead of the error page.

## Detail tabs in the URL

```ts
export const USER_TABS = ['overview', 'activity', 'sessions'] as const;
export const userDetailSearchSchema = z.object({
  tab: z.enum(USER_TABS).catch('overview').default('overview'),
});
```

Route: `validateSearch: userDetailSearchSchema`,
`search: { middlewares: [stripSearchParams({ tab: 'overview' })] }`.
Tabs switch with `navigate({ search: (prev) => ({ ...prev, tab }), replace: true })`.

## Create and edit routes

```tsx
// src/routes/_app/users/new.tsx
export const Route = createFileRoute('/_app/users/new')({
  beforeLoad: () => {
    requirePermission(PERMS.users.create);
  },
  loader: () => loadFeatureLocale('app/users'),
  component: UserCreateContainer,
});
```

```tsx
// src/routes/_app/users/$userId/edit.tsx — needs update permission, waits for the record
export const Route = createFileRoute('/_app/users/$userId/edit')({
  beforeLoad: () => {
    requirePermission(PERMS.users.update);
  },
  loader: async ({ context, params }) => {
    await Promise.all([
      loadFeatureLocale('app/users'),
      context.queryClient.query({ ...userDetailQueryOptions(params.userId), staleTime: 'static' }),
    ]);
  },
  component: RouteComponent,
});
```

## Writing search from the page hook

```ts
const routeApi = getRouteApi('/_app/users/');

export function useUsersListPage() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const setPage = (page: number) => {
    void navigate({ search: (prev) => ({ ...prev, page }) });
  };
  const setSort = (sort: string) => {
    void navigate({ search: (prev) => ({ ...prev, sort, page: 1 }) });
  };
  // …
}
```

## Tests

- `validations/search.test.ts`: `userSearchSchema.parse({ page: 'abc' })`
  gives page 1; unknown `pageSize` gives 20; `parse({})` equals the defaults.
- Integration: render the router at `/users?page=2&status=active` with MSW and
  assert the request carried those params.
- Guard: with no permission in the store, navigating to the route lands on `/403`.
