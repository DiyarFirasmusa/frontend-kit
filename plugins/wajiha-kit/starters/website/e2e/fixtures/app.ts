import { expect, test as base } from '@playwright/test';

export type Language = 'ar' | 'en';

export type AppOptions = {
  /** The language this project visits (the URL prefix). */
  language: Language;
};

type AppFixtures = {
  /** '/about' becomes '/ar/about' or '/en/about' for the project's language. */
  localized: (path: string) => string;
  /** Fails the test on any console error or uncaught exception (hydration problems, CSP violations). */
  guardConsole: void;
};

export const test = base.extend<AppOptions & AppFixtures>({
  language: ['ar', { option: true }],

  localized: async ({ language }, provide) => {
    await provide((path) => `/${language}${path === '/' ? '' : path}`);
  },

  guardConsole: [
    async ({ page }, provide) => {
      const problems: string[] = [];
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

/** Every public page, language-free. Add a new page here and every spec that loops over it covers it. */
export const PAGES = [
  { name: 'home', path: '' },
  { name: 'about', path: '/about' },
  { name: 'services', path: '/services' },
  { name: 'news', path: '/news' },
  { name: 'article', path: '/news/plan-your-first-quarter' },
  { name: 'contact', path: '/contact' },
] as const;

/** A 404 page that still has the site header (unknown page under a valid language). */
export const NOT_FOUND_PATH = '/does-not-exist';
