import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test as base, type Response } from '@playwright/test';
import { ARTICLES } from '../../src/features/website/news/data/articles';

export type Language = 'ar' | 'en';

export type AppOptions = {
  /** The language this project visits (the URL prefix). */
  language: Language;
};

type AppFixtures = {
  /** '/about' becomes '/ar/about' or '/en/about' for the project's language. */
  localized: (path: string) => string;
  /**
   * The site's own text for a key in the project's language ('contact.submit'). Tests find buttons and
   * messages through it, so changing the demo copy in the locale files does not break them.
   */
  t: (key: string) => string;
  /**
   * Opens a language-free path and waits until React has taken over the page (the root sets
   * <html data-hydrated="true">). Click only after this: a click on server HTML is a plain browser action.
   */
  open: (path: string) => Promise<Response | null>;
  /** Fails the test on any console error or uncaught exception (hydration problems, CSP violations). */
  guardConsole: void;
};

type Strings = Record<string, Record<string, string>>;

// Every locale file of one language (any "locales/<language>.json" under src), merged like the app does.
// Read from disk, not imported: the app's own JSON imports need Vite.
const SRC = fileURLToPath(new URL('../../src', import.meta.url));

function readStrings(language: Language): Strings {
  const strings: Strings = {};
  for (const file of readdirSync(SRC, { recursive: true, encoding: 'utf8' })) {
    if (file.replaceAll('\\', '/').endsWith(`locales/${language}.json`)) {
      Object.assign(strings, JSON.parse(readFileSync(join(SRC, file), 'utf8')) as Strings);
    }
  }
  return strings;
}

export const test = base.extend<AppOptions & AppFixtures>({
  language: ['ar', { option: true }],

  localized: async ({ language }, provide) => {
    await provide((path) => `/${language}${path === '/' ? '' : path}`);
  },

  t: async ({ language }, provide) => {
    const strings = readStrings(language);
    await provide((key) => {
      const [group = '', name = ''] = key.split('.');
      const text = strings[group]?.[name];
      if (text === undefined) {
        throw new Error(`no "${key}" in the ${language} locale files`);
      }
      return text;
    });
  },

  open: async ({ page, localized }, provide) => {
    await provide(async (path) => {
      const response = await page.goto(localized(path));
      await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
      return response;
    });
  },

  guardConsole: [
    async ({ page }, provide) => {
      const problems: string[] = [];
      // Report every Content-Security-Policy violation as a console error. Chrome's own console line for a
      // blocked inline style or eval is not always an error, but a violation is always a bug here.
      await page.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (event) => {
          console.error(
            `CSP violation: ${event.violatedDirective} blocked ${event.blockedURI || 'inline'}`,
          );
        });
      });
      // Chrome logs a page that answers 404 as a console error. A test that opens a 404 page on purpose
      // expects that one line; any other failed request is still a problem.
      const expectedNotFound = new Set<string>();
      page.on('response', (response) => {
        if (response.status() === 404 && response.request().isNavigationRequest()) {
          expectedNotFound.add(response.url());
        }
      });
      page.on('console', (message) => {
        if (message.type() === 'error' && !expectedNotFound.has(message.location().url)) {
          problems.push(`console: ${message.text()}`);
        }
      });
      page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
      await provide();
      expect(problems, 'no console errors or uncaught exceptions').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

const firstArticle = ARTICLES[0];
if (firstArticle === undefined) {
  throw new Error(
    'the e2e tests need at least one article in src/features/website/news/data/articles.ts',
  );
}

/** The first article in the data, so replacing the demo articles does not break the tests. */
export const ARTICLE = { slug: firstArticle.slug, date: firstArticle.date };

/** Every public page, language-free. Add a new page here and every spec that loops over it covers it. */
export const PAGES = [
  { name: 'home', path: '' },
  { name: 'about', path: '/about' },
  { name: 'services', path: '/services' },
  { name: 'news', path: '/news' },
  { name: 'article', path: `/news/${ARTICLE.slug}` },
  { name: 'contact', path: '/contact' },
] as const;

/** A 404 page that still has the site header (unknown page under a valid language). */
export const NOT_FOUND_PATH = '/does-not-exist';

/** A message containing this text makes the e2e webhook receiver answer 500 (see scripts/e2e-server.mjs). */
export const WEBHOOK_FAIL_MARKER = 'e2e-webhook-fail';
