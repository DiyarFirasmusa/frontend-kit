import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import type { A11yPage } from './a11y-pages/types';
import { expect, loginAs, test } from './fixtures/app';

/**
 * Automated accessibility gate (axe-core, WCAG 2.1 A/AA). Runs in every
 * language × theme project, so contrast is checked in dark mode and RTL too.
 *
 * Pages are not listed here: every module in e2e/a11y-pages/ (except types.ts)
 * exports a `pages` array, and all of them are scanned. Add a new page by
 * adding an entry to the feature's file there. Guarded entries sign in with
 * `loginAs`. Any page that fetches data needs a `mocks` callback. A request to
 * the e2e API or auth origin without a mock is answered with an empty 200 so the
 * page can still load, and the test then fails on that request, so a missing
 * mock is fixed in the page entry rather than hidden by the scan.
 */

/** A dev server under six workers can take a while to serve a route's modules. */
const READY = { timeout: 15_000 };

const PAGE_DIR = fileURLToPath(new URL('./a11y-pages/', import.meta.url));

const pageFiles = readdirSync(PAGE_DIR)
  .filter((file) => file.endsWith('.ts') && file !== 'types.ts')
  .toSorted();

const PAGES: A11yPage[] = [];
for (const file of pageFiles) {
  const mod = (await import(pathToFileURL(join(PAGE_DIR, file)).href)) as {
    pages?: A11yPage[];
  };
  PAGES.push(...(mod.pages ?? []));
}

/**
 * Requests to the e2e API / auth origins that no mock claimed. CORS preflights
 * get a 204; every other request is recorded and answered with an empty 200 so
 * the page can render. Registered first so every specific mock (registered
 * later) takes precedence: Playwright matches the last route. The returned list
 * must be empty once the page has loaded (see the assertion in the test).
 */
const E2E_ORIGIN = /^http:\/\/(api|auth)\.e2e\.test\//;

async function stubUnmockedApi(page: Page): Promise<string[]> {
  const unmocked: string[] = [];
  await page.route(E2E_ORIGIN, (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': request.headers().origin ?? '*',
          'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'access-control-allow-headers':
            request.headers()['access-control-request-headers'] ?? '*',
          'access-control-allow-credentials': 'true',
        },
      });
    }
    unmocked.push(`${request.method()} ${request.url()}`);
    return route.fulfill({
      status: 200,
      headers: {
        'access-control-allow-origin': request.headers().origin ?? '*',
        'access-control-allow-credentials': 'true',
      },
      json: {},
    });
  });
  return unmocked;
}

for (const { name, path, guarded, mocks } of PAGES) {
  test(`${name} page has no serious accessibility violations`, async ({
    page,
    mockApi,
  }) => {
    const unmocked = await stubUnmockedApi(page);
    if (guarded) {
      await loginAs(page, mockApi);
    }
    if (mocks) {
      await mocks(mockApi);
    }
    /* Requests fired while logging in belong to the landing page, not to the
       page under test. */
    unmocked.length = 0;
    await page.goto(path);
    /* A ready page, not "network idle" (polling and slow dev-server
       modules made that flaky): the root has rendered, a heading is
       visible and no skeleton is left. */
    await expect(page.locator('#root')).not.toBeEmpty();
    await expect(page.getByRole('heading').first()).toBeVisible(READY);
    await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0, READY);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addStyleTag({
      content:
        '*, *::before, *::after { transition: none; animation-duration: 0s; animation-delay: 0s; }',
    });
    await page.waitForFunction(() =>
      document
        .getAnimations()
        .every(
          (animation) =>
            animation.effect?.getComputedTiming().iterations === Infinity ||
            animation.playState !== 'running',
        ),
    );

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(
      blocking.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
      })),
    ).toEqual([]);
    expect(
      unmocked,
      'unmocked requests: add a mock to the a11y page entry',
    ).toEqual([]);
  });
}
