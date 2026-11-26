import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { routeTree } from '@/routeTree.gen';
import { createTestQueryClient } from './render';

/**
 * Renders the real app at `url`: the generated route tree with its guards,
 * search schemas, loaders and the root providers, on a memory history and a
 * fresh query client. Use it for page integration tests; sign in first
 * (`signIn` from test/fixtures/auth) or the guards redirect to /login.
 */
export async function renderApp(url: string) {
  const queryClient = createTestQueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [url] }),
  });
  await router.load();
  const user = userEvent.setup();
  const result = render(<RouterProvider router={router} />);
  return { ...result, user, router, queryClient };
}
