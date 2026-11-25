import { expect, test } from '../fixtures/app';

const LABELS = {
  ar: { about: 'من نحن', services: 'خدماتنا', news: 'الأخبار', contact: 'تواصل معنا' },
  en: { about: 'About', services: 'Services', news: 'News', contact: 'Contact' },
} as const;

test.describe('navigation', () => {
  test('menu links move between pages without a full reload', async ({
    page,
    localized,
    language,
    isMobile,
  }) => {
    await page.goto(localized(''));
    await page.evaluate(() => {
      (window as unknown as { __marker: string }).__marker = 'same-document';
    });

    if (isMobile) {
      await page
        .getByRole('button', { name: language === 'ar' ? 'فتح القائمة' : 'Open menu' })
        .click();
    }
    const nav = page.getByRole('navigation', {
      name: language === 'ar' ? 'القائمة الرئيسية' : 'Main menu',
    });
    await nav.getByRole('link', { name: LABELS[language].services }).click();

    await expect(page).toHaveURL(new RegExp(`/${language}/services$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Client-side navigation: the document (and our marker) survived.
    expect(await page.evaluate(() => (window as unknown as { __marker?: string }).__marker)).toBe(
      'same-document',
    );
    if (isMobile) {
      await page
        .getByRole('button', { name: language === 'ar' ? 'فتح القائمة' : 'Open menu' })
        .click();
    }
    await expect(nav.getByRole('link', { name: LABELS[language].services })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('the phone menu opens, closes and reports its state', async ({
    page,
    localized,
    language,
    isMobile,
  }) => {
    test.skip(!isMobile, 'phone only');
    await page.goto(localized(''));
    const toggle = page.getByRole('button', {
      name: language === 'ar' ? 'فتح القائمة' : 'Open menu',
    });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#site-nav')).toBeHidden();
    await toggle.click();
    await expect(page.locator('#site-nav')).toBeVisible();
    await page
      .getByRole('button', { name: language === 'ar' ? 'إغلاق القائمة' : 'Close menu' })
      .click();
    await expect(page.locator('#site-nav')).toBeHidden();
  });

  test('home page links reach the article and back', async ({ page, localized, language }) => {
    await page.goto(localized(''));
    const firstTitle = page.getByRole('main').getByRole('heading', { level: 3 }).last();
    await firstTitle.getByRole('link').click();
    await expect(page).toHaveURL(new RegExp(`/${language}/news/[a-z-]+$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page
      .getByRole('link', { name: language === 'ar' ? 'العودة إلى الأخبار' : 'Back to news' })
      .click();
    await expect(page).toHaveURL(new RegExp(`/${language}/news$`));
  });

  test('skip link jumps to the main content with the keyboard', async ({
    page,
    localized,
    language,
    isMobile,
  }) => {
    test.skip(isMobile, 'keyboard only');
    await page.goto(localized(''));
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', {
      name: language === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content',
    });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe('language switch', () => {
  test('keeps the same page, flips direction and remembers the choice for "/"', async ({
    page,
    localized,
    language,
    context,
    isMobile,
  }) => {
    test.skip(isMobile, 'covered on desktop');
    const other = language === 'ar' ? 'en' : 'ar';
    await page.goto(localized('/news/plan-your-first-quarter'));
    await page
      .getByRole('banner')
      .getByRole('link', { name: language === 'ar' ? 'English' : 'العربية' })
      .click();

    await expect(page).toHaveURL(new RegExp(`/${other}/news/plan-your-first-quarter$`));
    await expect(page.locator('html')).toHaveAttribute('lang', other);
    await expect(page.locator('html')).toHaveAttribute('dir', other === 'ar' ? 'rtl' : 'ltr');

    const cookies = await context.cookies();
    expect(cookies.find((cookie) => cookie.name === 'lang')?.value).toBe(other);
    await page.goto('/');
    await expect(page).toHaveURL(new RegExp(`/${other}$`));
  });
});

test.describe('theme', () => {
  test('the toggle switches the theme, survives a reload and is applied before first paint', async ({
    page,
    localized,
    colorScheme,
  }) => {
    await page.goto(localized(''));
    const root = page.locator('html');
    const start = colorScheme === 'dark' ? 'dark' : 'light';
    const next = start === 'dark' ? 'light' : 'dark';
    const background = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
    const startBackground = await background();

    await page.getByRole('button', { name: /theme|المظهر/ }).click();
    await expect(root).toHaveAttribute('data-theme', next);
    expect(await background()).not.toBe(startBackground);

    await page.reload();
    await expect(root).toHaveAttribute('data-theme', next);

    // The saved choice is on <html> before the first paint: the inline script ran, not React.
    const html = await (await page.request.get(page.url())).text();
    expect(html).toContain("localStorage.getItem('theme')");
  });
});
