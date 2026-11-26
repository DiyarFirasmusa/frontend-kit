import { ARTICLE, expect, test } from '../fixtures/app';

test.describe('navigation', () => {
  test('menu links move between pages without a full reload, then focus and announce the new page', async ({
    page,
    open,
    t,
    isMobile,
  }) => {
    await open('');
    await page.evaluate(() => {
      (window as unknown as { __marker: string }).__marker = 'same-document';
    });

    if (isMobile) {
      await page.getByRole('button', { name: t('nav.openMenu') }).click();
    }
    const nav = page.getByRole('navigation', { name: t('nav.main') });
    await nav.getByRole('link', { name: t('nav.services') }).click();

    await expect(page).toHaveURL(/\/services$/);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    // Client-side navigation: the document (and our marker) survived.
    expect(await page.evaluate(() => (window as unknown as { __marker?: string }).__marker)).toBe(
      'same-document',
    );
    // Screen readers: focus is on the new page's heading, and the live region names the page.
    await expect(heading).toBeFocused();
    await expect(page.getByRole('status').filter({ hasText: /\S/ })).toHaveText(
      (await heading.textContent()) ?? '',
    );

    if (isMobile) {
      await page.getByRole('button', { name: t('nav.openMenu') }).click();
    }
    await expect(nav.getByRole('link', { name: t('nav.services') })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('the phone menu opens, closes with its button or Escape, and reports its state', async ({
    page,
    open,
    t,
    isMobile,
  }) => {
    test.skip(!isMobile, 'phone only');
    await open('');
    const toggle = page.getByRole('button', { name: t('nav.openMenu') });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#site-nav')).toBeHidden();
    await toggle.click();
    await expect(page.locator('#site-nav')).toBeVisible();
    await page.getByRole('button', { name: t('nav.closeMenu') }).click();
    await expect(page.locator('#site-nav')).toBeHidden();

    await toggle.click();
    await expect(page.locator('#site-nav')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#site-nav')).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('home page links reach the article and back', async ({ page, open, t }) => {
    await open('');
    const firstTitle = page.getByRole('main').getByRole('heading', { level: 3 }).last();
    await firstTitle.getByRole('link').click();
    await expect(page).toHaveURL(/\/news\/[a-z0-9-]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByRole('link', { name: t('news.backToList') }).click();
    await expect(page).toHaveURL(/\/news$/);
  });

  test('skip link jumps to the main content with the keyboard', async ({
    page,
    open,
    t,
    isMobile,
  }) => {
    test.skip(isMobile, 'keyboard only');
    await open('');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: t('common.skipToContent') });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe('focus ring', () => {
  /** WCAG contrast ratio of two computed rgb() colours. */
  const contrast = (a: string, b: string): number => {
    const luminance = (color: string) => {
      const [r = 0, g = 0, bl = 0] = (color.match(/\d+(\.\d+)?/g) ?? []).map(Number);
      const channel = (value: number) => {
        const c = value / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(bl);
    };
    const [light, dark] = [luminance(a), luminance(b)].toSorted((x, y) => y - x);
    return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
  };

  test('is visible on every button style, including inside the primary-colour block', async ({
    page,
    open,
    t,
    isMobile,
  }) => {
    test.skip(isMobile, 'keyboard only');
    await open('');
    const targets = [
      page.getByRole('main').getByRole('link', { name: t('home.heroPrimary') }),
      page.getByTestId('home-cta').getByRole('link'),
    ];
    for (const target of targets) {
      // Arrive with the keyboard, so :focus-visible applies exactly as for a keyboard user.
      await target.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(target).toBeFocused();
      // Buttons animate their colours (the ring too): measure once the transition has finished.
      await expect.poll(() => target.evaluate((element) => element.getAnimations().length)).toBe(0);
      const ring = await target.evaluate((element) => {
        const style = getComputedStyle(element);
        let parent = element.parentElement;
        let background = 'rgba(0, 0, 0, 0)';
        while (parent !== null) {
          background = getComputedStyle(parent).backgroundColor;
          if (background !== 'rgba(0, 0, 0, 0)') {
            break;
          }
          parent = parent.parentElement;
        }
        if (parent === null) {
          background = getComputedStyle(document.documentElement).backgroundColor;
        }
        return { style: style.outlineStyle, color: style.outlineColor, background };
      });
      expect(ring.style).toBe('solid');
      // WCAG 2.4.11: the ring differs from what is around it by at least 3:1.
      expect(contrast(ring.color, ring.background)).toBeGreaterThanOrEqual(3);
    }
  });
});

test.describe('language switch', () => {
  test('keeps the same page, flips direction and remembers the choice for "/"', async ({
    page,
    open,
    language,
    context,
    t,
    isMobile,
  }) => {
    test.skip(isMobile, 'covered on desktop');
    const other = language === 'ar' ? 'en' : 'ar';
    await open(`/news/${ARTICLE.slug}`);
    await page
      .getByRole('banner')
      .getByRole('link', { name: t('common.switchLanguage') })
      .click();

    await expect(page).toHaveURL(new RegExp(`/${other}/news/${ARTICLE.slug}$`));
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
    open,
    t,
    colorScheme,
  }) => {
    await open('');
    const root = page.locator('html');
    const start = colorScheme === 'dark' ? 'dark' : 'light';
    const next = start === 'dark' ? 'light' : 'dark';
    const background = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
    const startBackground = await background();

    await page.getByRole('button', { name: t('common.switchTheme') }).click();
    await expect(root).toHaveAttribute('data-theme', next);
    expect(await background()).not.toBe(startBackground);

    await page.reload();
    await expect(root).toHaveAttribute('data-theme', next);

    // The saved choice is on <html> before the first paint: the inline script ran, not React.
    const html = await (await page.request.get(page.url())).text();
    expect(html).toContain("localStorage.getItem('theme')");
  });
});
