import { chromium, type FullConfig } from '@playwright/test';

/** Warms the dev server: one browser visit makes Vite transform the app. */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) {
    return;
  }
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const path of ['/login', '/suppliers', '/this-route-does-not-exist']) {
      await page.goto(`${baseURL}${path}`, { timeout: 120_000 });
      await page.locator('#root > *').first().waitFor({ timeout: 120_000 });
    }
  } finally {
    await browser.close();
  }
}
