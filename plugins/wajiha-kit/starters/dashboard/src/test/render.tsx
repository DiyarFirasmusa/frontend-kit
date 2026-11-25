import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/context/theme-provider';
import { getDir } from '@/lib/i18n/i18n';

/** A QueryClient with retries off so failing queries settle immediately. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface ProvidersProps {
  children: ReactNode;
  queryClient: QueryClient;
}

function Providers({ children, queryClient }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div dir={getDir()}>{children}</div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

/**
 * Render a component inside the app providers (theme, query, tooltip, dir).
 * Use for components and hooks that do NOT touch the router.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...options
  }: RenderWithProvidersOptions = {},
) {
  const user = userEvent.setup();
  const result = render(ui, {
    wrapper: ({ children }) => (
      <Providers queryClient={queryClient}>{children}</Providers>
    ),
    ...options,
  });
  return { ...result, user, queryClient };
}

interface RenderWithRouterOptions extends RenderWithProvidersOptions {
  /** Path the UI is mounted at (default `/`). */
  path?: string;
  /** Initial history entries (default `[path]`). */
  initialEntries?: string[];
}

/**
 * Render a component as the only route of a memory router, wrapped in the app
 * providers. Use for containers that call `useNavigate` / `useRouter` /
 * `Link`. Resolves once the route has rendered; returns the router so tests
 * can assert on navigation.
 */
export async function renderWithRouter(
  ui: ReactElement,
  {
    path = '/',
    initialEntries,
    queryClient = createTestQueryClient(),
    ...options
  }: RenderWithRouterOptions = {},
) {
  const rootRoute = createRootRoute({
    component: () => (
      <Providers queryClient={queryClient}>
        <Outlet />
      </Providers>
    ),
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: () => ui,
  });
  const catchAllRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '$',
    component: () => null,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, catchAllRoute]),
    history: createMemoryHistory({ initialEntries: initialEntries ?? [path] }),
  });

  await router.load();
  const user = userEvent.setup();
  const result = render(<RouterProvider router={router} />, options);
  await result.findAllByText(() => true, { selector: 'div[dir]' });
  return { ...result, user, queryClient, router };
}

export * from '@testing-library/react';
export { userEvent };
