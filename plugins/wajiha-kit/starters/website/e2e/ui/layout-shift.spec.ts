import { expect, PAGES, test } from '../fixtures/app';

// A performance budget written as a test: the page must not jump while it loads (fonts, images, hydration).
// It runs in the "perf" projects, which start after the other projects finish: a busy machine delays font
// downloads, and that would measure the machine, not the page.
const CLS_BUDGET = 0.01;

test.describe('layout shift', () => {
  for (const target of PAGES) {
    test(`${target.name} stays under ${CLS_BUDGET}`, async ({ page, localized }) => {
      await page.addInitScript(() => {
        const state = { value: 0 };
        (window as unknown as { __cls: typeof state }).__cls = state;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as Array<{
            value: number;
            hadRecentInput: boolean;
          }>) {
            if (!entry.hadRecentInput) {
              state.value += entry.value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(localized(target.path), { waitUntil: 'networkidle' });
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      // Two more seconds of life: late shifts count too.
      await page.waitForTimeout(2000);
      const cls = await page.evaluate(
        () => (window as unknown as { __cls: { value: number } }).__cls.value,
      );
      expect(cls).toBeLessThan(CLS_BUDGET);
    });
  }
});
