import { QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  type AnyRoute,
  type AnyRouter,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createSiteI18n } from '@/features/site/i18n/resources';
import type { Locale } from '@/shared/lib/i18n/languages';
import { testI18n } from './i18n';
import { createTestQueryClient } from './render';

type Options = {
  /** The URL the memory history starts on, query string included. */
  url: string;
  /**
   * The site's own i18n instance (public texts only, no admin bundle) in this language instead of the
   * shared test instance. Use it to prove a component works before the admin's text is loaded.
   */
  siteOnly?: Locale;
};

async function mount(router: AnyRouter, options: Options) {
  const user = userEvent.setup();
  await router.load();
  const i18n = options.siteOnly === undefined ? testI18n : createSiteI18n(options.siteOnly);
  const result = render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={createTestQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nextProvider>,
  );
  return { ...result, user, router };
}

/** Renders one element at any URL: a catch-all route holds it, so links and the router state work. */
export async function renderAtUrl(element: ReactElement, options: Options) {
  const root = createRootRoute();
  const page = createRoute({ getParentRoute: () => root, path: '$', component: () => element });
  const router = createRouter({
    routeTree: root.addChildren([page]),
    history: createMemoryHistory({ initialEntries: [options.url] }),
  });
  return mount(router, options);
}

/** Renders a hand-built route tree (a layout with children, search validation ...) at a URL. */
export async function renderRoutes(build: (root: AnyRoute) => AnyRoute[], options: Options) {
  const root = createRootRoute();
  const router = createRouter({
    routeTree: root.addChildren(build(root)),
    history: createMemoryHistory({ initialEntries: [options.url] }),
  });
  return mount(router, options);
}
