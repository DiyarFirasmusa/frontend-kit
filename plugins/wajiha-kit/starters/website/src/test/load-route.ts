// The real route tree, loaded in memory with no server: what `router.load()` leaves in the matches for a URL.
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';
import { createI18n } from '@/shared/lib/i18n/create-i18n';
import { localeFromPath } from '@/shared/lib/i18n/languages';
import { failureOf } from '@/shared/lib/seo/failed-page';

export function createTestRouter(path = '/') {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { i18n: createI18n(localeFromPath(path) ?? 'ar') },
  });
}

export async function loadRoute(path: string) {
  const router = createTestRouter(path);
  await router.load();
  const matches = router.state.matches;
  const metas = matches.flatMap((match) => match.meta ?? []);
  return {
    router,
    matches,
    metas,
    links: matches.flatMap((match) => match.links ?? []),
    failure: failureOf(matches),
    title: metas.find((meta) => meta !== undefined && 'title' in meta),
    robots: metas.find((meta) => meta !== undefined && 'name' in meta && meta.name === 'robots'),
  };
}
