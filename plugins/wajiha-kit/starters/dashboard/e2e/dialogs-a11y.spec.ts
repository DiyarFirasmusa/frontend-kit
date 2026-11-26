import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, loginAs, test } from './fixtures/app';

const OPEN_NAV = /^(open navigation menu|فتح قائمة التنقل)$/i;
// Topbar trigger is named by the display name from the shell's /me mock.
const USER_MENU = /Ali Karkhi/i;

test.describe('dialog accessibility', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.shell();
    await loginAs(page, mockApi);
  });

  test('mobile navigation sheet has no serious or critical axe violations', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    /* Scan the settled sheet, not a frame of its slide-in: half-transparent
       text mid-animation reads as a false contrast failure. */
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addStyleTag({
      content:
        '*, *::before, *::after { transition: none; animation-duration: 0s; animation-delay: 0s; }',
    });
    await page
      .locator('header[data-slot="topbar"]')
      .getByRole('button', { name: OPEN_NAV })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.waitForFunction(() =>
      document
        .getAnimations()
        .every((animation) => animation.playState !== 'running'),
    );

    const accessibility = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      accessibility.violations.filter((v) =>
        ['serious', 'critical'].includes(v.impact ?? ''),
      ),
    ).toEqual([]);
  });

  test('topbar user menu has no serious or critical axe violations', async ({
    page,
  }) => {
    await page.getByRole('button', { name: USER_MENU }).click();
    await expect(page.getByRole('menu')).toBeVisible();

    const accessibility = await new AxeBuilder({ page })
      .include('[role="menu"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      accessibility.violations.filter((v) =>
        ['serious', 'critical'].includes(v.impact ?? ''),
      ),
    ).toEqual([]);
  });
});

async function expectNoSeriousViolations(page: Page) {
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState !== 'running'),
  );
  const accessibility = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    accessibility.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    ),
  ).toEqual([]);
}

/* Page scans (a11y-pages) never open a dialog, so a placeholder or a field
   inside one needs its own scan. The user picker's placeholder was 4.2:1. */
test.describe('form dialog accessibility', () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await mockApi.backend();
    await loginAs(page, mockApi);
  });

  test('the warehouse form (manager picker) has no serious axe violations', async ({
    page,
  }) => {
    await page.goto('/warehouses');
    await page
      .getByRole('button', { name: /^(Add warehouse|إنشاء مستودع)$/ })
      .click();
    await expectNoSeriousViolations(page);
  });

  test('the add member dialog has no serious axe violations', async ({
    page,
  }) => {
    await page.goto('/warehouses?q=WH-BGD');
    await page
      .getByRole('row')
      .filter({ hasText: 'WH-BGD-01' })
      .getByRole('link')
      .click();
    await page.getByRole('tab', { name: /^(Members|الأعضاء)$/ }).click();
    await page
      .getByRole('button', { name: /^(Add member|إضافة عضو)$/ })
      .click();
    await expectNoSeriousViolations(page);
  });
});
