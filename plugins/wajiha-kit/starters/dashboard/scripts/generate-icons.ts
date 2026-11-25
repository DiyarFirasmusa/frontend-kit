/**
 * Renders public/icon.svg into the PNG icons browsers and phones need
 * (favicon, apple-touch-icon, PWA 192/512, maskable). Uses the Chromium that
 * Playwright already installs (`npm run e2e:install`). Run: `npm run icons`.
 * Replace public/icon.svg with your own mark first.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = (name: string): string =>
  fileURLToPath(new URL(`../public/${name}`, import.meta.url));

const svg = readFileSync(root('icon.svg'), 'utf-8');

/** Same mark without the rounded corners and with room around it (maskable safe zone). */
const maskableSvg = svg
  .replace(/ rx="112"/u, '')
  .replace(
    '<g fill',
    '<g transform="translate(256 256) scale(0.82) translate(-256 -256)" fill',
  );

const jobs: { file: string; size: number; source: string }[] = [
  { file: 'favicon-32.png', size: 32, source: svg },
  { file: 'apple-touch-icon.png', size: 180, source: maskableSvg },
  { file: 'icon-192.png', size: 192, source: svg },
  { file: 'icon-512.png', size: 512, source: svg },
  { file: 'icon-maskable-512.png', size: 512, source: maskableSvg },
];

const browser = await chromium.launch();
try {
  for (const { file, size, source } of jobs) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
    });
    await page.setContent(
      `<body style="margin:0;background:transparent">${source.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`,
    );
    const png = await page.screenshot({ omitBackground: true });
    writeFileSync(root(file), png);
    await page.close();
    console.log(`wrote public/${file}`);
  }
} finally {
  await browser.close();
}
