// Walks the real route tree: every public route must ship a title, a description, a canonical and the language
// alternates. A page whose head cannot be built (no NAV entry: `navItemFor` throws inside head(), and the router
// swallows it) would otherwise answer 200 with an empty head, and nothing else would notice.
import { describe, expect, it } from 'vitest';
import { CANONICAL_SITE } from '@/config/canonical-site';
import { ARTICLE_META } from '@/content/articles.data';
import { LANGUAGES, LOCALES } from '@/shared/lib/i18n/languages';
import { createTestRouter, loadRoute } from '@/test/load-route';

const FIX_HEAD =
  'Add a navItem(...) for the page to NAV in src/config/nav.config.ts (CLAUDE.md, "Add a page"), or give the route a head() built with seo()';

/** A sample value for each route parameter other than the language; teach it a new one when a route needs it. */
const SAMPLE_PARAMS: Readonly<Record<string, string>> = {
  slug: ARTICLE_META[0]?.slug ?? 'missing-sample-article',
};

/** Route templates like '/$locale/news/$slug': every public page, no splat, no server-only file route. */
function publicRoutePaths(): string[] {
  return Object.keys(createTestRouter().routesByPath).filter(
    (path) => path.startsWith('/$locale') && path !== '/$locale/$',
  );
}

function urlFor(template: string, locale: string): string {
  return template.replace(/\$(\w+)/g, (_, name: string) => {
    if (name === 'locale') {
      return locale;
    }
    const sample = SAMPLE_PARAMS[name];
    if (sample === undefined) {
      throw new Error(`${template}: add a sample for the "$${name}" parameter to SAMPLE_PARAMS`);
    }
    return sample;
  });
}

describe('every public route declares its head', () => {
  const templates = publicRoutePaths();

  it('finds the public routes (so the loop below cannot pass by checking nothing)', () => {
    expect(templates).toEqual(
      expect.arrayContaining(['/$locale', '/$locale/news', '/$locale/news/$slug']),
    );
  });

  for (const template of templates) {
    it(`${template}: title, description, canonical and every language alternate, in every language`, async () => {
      for (const locale of LOCALES) {
        const url = urlFor(template, locale);
        const page = await loadRoute(url);
        expect(page.failure, `${url} is a failed page`).toBeUndefined();
        const describes = page.metas.some(
          (meta) => meta !== undefined && 'name' in meta && meta.name === 'description',
        );
        expect(page.title !== undefined, `${url} has no <title>. ${FIX_HEAD}`).toBe(true);
        expect(describes, `${url} has no meta description. ${FIX_HEAD}`).toBe(true);
        expect(
          page.links.some((link) => link?.rel === 'canonical'),
          `${url} has no canonical link. ${FIX_HEAD}`,
        ).toBe(true);
        const hreflangs = page.links
          .filter((link) => link?.rel === 'alternate')
          .map((link) => String(link?.hrefLang));
        expect(hreflangs.toSorted(), `${url} alternates. ${FIX_HEAD}`).toEqual(
          [...LOCALES.map((l) => LANGUAGES[l].hreflang), 'x-default'].toSorted(),
        );
      }
    });
  }

  it('a route with a slug has a resolver in CANONICAL_SITE (src/config/canonical-site.ts)', () => {
    for (const template of templates) {
      const match = /^\/\$locale\/([^/$]+)\/\$\w+$/.exec(template);
      if (match !== null) {
        expect(
          Object.hasOwn(CANONICAL_SITE.slugRoutes, match[1] ?? ''),
          `${template}: add "${match[1]}" to slugRoutes in src/config/canonical-site.ts, or other-case variants of its URLs are not redirected`,
        ).toBe(true);
      }
    }
  });

  it('the root head never declares theme-color: the router keeps one meta per name, so it would drop one', async () => {
    const page = await loadRoute('/en');
    expect(
      page.metas.some(
        (meta) => meta !== undefined && 'name' in meta && meta.name === 'theme-color',
      ),
    ).toBe(false);
  });
});
