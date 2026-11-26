import { LANGUAGES, otherLocales } from '../../src/shared/lib/i18n/languages';
import { expect, NOT_FOUND_PATH, PAGES, test } from '../fixtures/app';

test.describe('every page renders in the project language and fits the screen', () => {
  for (const page of PAGES) {
    test(`${page.name}`, async ({ page: browser, localized, language }) => {
      await browser.goto(localized(page.path));

      const html = browser.locator('html');
      await expect(html).toHaveAttribute('lang', language);
      await expect(html).toHaveAttribute('dir', LANGUAGES[language].dir);
      await expect(browser.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(browser.getByRole('banner')).toBeVisible();
      await expect(browser.getByRole('contentinfo')).toBeVisible();
      await expect(browser).toHaveTitle(/\S/);

      // Nothing sticks out sideways (the usual RTL and phone bug).
      const overflow = await browser.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
    });
  }

  test('the 404 page keeps the header and offers a way home', async ({
    page,
    open,
    language,
    t,
  }) => {
    const response = await open(NOT_FOUND_PATH);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(t('error.notFoundTitle'));
    await page.getByRole('main').getByRole('link').first().click();
    await expect(page).toHaveURL(new RegExp(`/${language}$`));
  });

  test('an unknown article is a 404 page, not an empty article', async ({ page, localized }) => {
    const response = await page.goto(localized('/news/no-such-article'));
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('banner')).toBeVisible();
  });

  test('direction-aware layout: the language link sits at the end of the header', async ({
    page,
    localized,
    language,
  }) => {
    await page.goto(localized(''));
    const header = page.getByRole('banner');
    const [other = language] = otherLocales(language);
    const switcher = header.getByRole('link', { name: LANGUAGES[other].label });
    const logo = header.getByRole('link').first();
    const [logoBox, switcherBox] = await Promise.all([logo.boundingBox(), switcher.boundingBox()]);
    expect(logoBox).not.toBeNull();
    expect(switcherBox).not.toBeNull();
    if (logoBox && switcherBox) {
      // The logo is at the start (right in Arabic, left in English); the language link is at the other side.
      if (LANGUAGES[language].dir === 'rtl') {
        expect(logoBox.x).toBeGreaterThan(switcherBox.x);
      } else {
        expect(logoBox.x).toBeLessThan(switcherBox.x);
      }
    }
  });
});
