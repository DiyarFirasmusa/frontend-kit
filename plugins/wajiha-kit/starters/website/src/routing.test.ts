// The real route tree, loaded in memory (no server): what each kind of URL matches, which status the matches
// carry, and what the root head puts in the title and robots meta. This is what makes a 404 for an unmatched
// URL keep its title and `noindex`, without reading any private router field (see failed-page.ts).
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { ARTICLE_META } from '@/content/articles.data';
import { routeTree } from '@/routeTree.gen';
import { createI18n } from '@/shared/lib/i18n/create-i18n';
import { localeFromPath } from '@/shared/lib/i18n/languages';
import { failureOf } from '@/shared/lib/seo/failed-page';

async function load(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { i18n: createI18n(localeFromPath(path) ?? 'ar') },
  });
  await router.load();
  const matches = router.state.matches;
  const metas = matches.flatMap((match) => match.meta ?? []);
  return {
    router,
    matches,
    failure: failureOf(matches),
    title: metas.find((meta) => meta !== undefined && 'title' in meta),
    robots: metas.find((meta) => meta !== undefined && 'name' in meta && meta.name === 'robots'),
  };
}

describe('route tree', () => {
  it('a real page is not a failure, and carries a typed locale param', async () => {
    const result = await load('/en/about');
    expect(result.failure).toBeUndefined();
    expect(result.matches.at(-1)?.routeId).toBe('/$locale/about');
    expect(result.matches.at(-1)?.params).toEqual({ locale: 'en' });
  });

  it('an unmatched URL under a language is a notFound failure with a title and noindex', async () => {
    for (const path of ['/en/nothing', '/ar/a/b/c', '/en/about/extra']) {
      const result = await load(path);
      expect(result.failure, path).toBe('notFound');
      expect(result.matches.at(-1)?.routeId, path).toBe('/$locale/$');
      // The 404 is drawn by the splat route itself, a child of the language layout (header and footer stay).
      expect(result.matches.find((match) => match.status === 'notFound')?.routeId, path).toBe(
        '/$locale/$',
      );
      expect(result.title, path).toEqual({
        title: path.startsWith('/ar') ? 'الصفحة غير موجودة' : 'Page not found',
      });
      expect(result.robots, path).toEqual({ name: 'robots', content: 'noindex, nofollow' });
    }
  });

  it('an unknown language is not a /$locale match: it falls to the root splat and is a notFound failure', async () => {
    for (const path of ['/fr/about', '/fr', '/zz/news/x', '/EN/about']) {
      const result = await load(path);
      expect(
        result.matches.some((match) => match.routeId === '/$locale'),
        path,
      ).toBe(false);
      expect(result.failure, path).toBe('notFound');
      expect(result.robots, path).toEqual({ name: 'robots', content: 'noindex, nofollow' });
    }
  });

  it('a missing article is a notFound failure; a real one loads its article, not a slug', async () => {
    expect((await load('/en/news/no-such-article')).failure).toBe('notFound');
    const slug = ARTICLE_META[0]?.slug ?? '';
    const real = await load(`/en/news/${slug}`);
    expect(real.failure).toBeUndefined();
    expect(real.matches.at(-1)?.loaderData).toMatchObject({
      article: { slug, body: expect.any(Array) },
    });
  });

  it('the home page and the news list load their cards in the page language', async () => {
    const home = await load('/ar');
    expect(home.matches.at(-1)?.loaderData).toMatchObject({ latest: expect.any(Array) });
    const list = await load('/en/news');
    expect(list.matches.at(-1)?.loaderData).toMatchObject({ cards: expect.any(Array) });
  });
});
