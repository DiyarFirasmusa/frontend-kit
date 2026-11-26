import { AxeBuilder } from '@axe-core/playwright';
import { expect, NOT_FOUND_PATH, PAGES, test } from '../fixtures/app';

// Serious and critical problems fail. Runs in every project, so Arabic RTL, English LTR, phone and dark
// contrast are all covered by the same list of pages.
const TARGETS = [
  ...PAGES.map((page) => ({ name: page.name, path: page.path })),
  { name: '404', path: NOT_FOUND_PATH },
];

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
  for (const target of TARGETS) {
    test(`${target.name}`, async ({ page, open }) => {
      await open(target.path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      const blocking = results.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact ?? ''),
      );
      expect(
        blocking.map((violation) => ({
          rule: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.map((node) => node.target.join(' ')),
        })),
      ).toEqual([]);
    });
  }

  test('the phone menu is accessible when open', async ({ page, open, isMobile, t }) => {
    test.skip(!isMobile, 'phone only');
    await open('');
    await page.getByRole('button', { name: t('nav.openMenu') }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')),
    ).toEqual([]);
  });

  test('the contact form is accessible with its error messages showing', async ({
    page,
    open,
    t,
  }) => {
    await open('/contact');
    await page.getByRole('button', { name: t('contact.submit') }).click();
    await expect(page.getByRole('alert').filter({ hasText: /\S/ }).first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')),
    ).toEqual([]);
  });
});
