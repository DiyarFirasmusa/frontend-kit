import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from '@tanstack/react-router';
import { createElement, type ReactNode } from 'react';
import { createTestQueryClient } from './render';

/** Router and query context for `renderHook`, so `useNavigate` and queries resolve. */
export function createHookWrapper(
  queryClient: QueryClient = createTestQueryClient(),
  initialPath = '/approvals',
) {
  const router = createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  function HookWrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RouterContextProvider, { router, children }),
    );
  }
  return { queryClient, wrapper: HookWrapper };
}
