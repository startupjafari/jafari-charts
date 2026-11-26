// Usage: node scripts/shot.mjs <url> <out.png> [width] [--full] [--dark]
// Screenshots a page with Playwright's Chromium and prints console errors.
/* global document */
import { chromium } from '@playwright/test';

const [url, out, width = '1280'] = process.argv.slice(2);
const full = process.argv.includes('--full');
const dark = process.argv.includes('--dark');
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  colorScheme: dark ? 'dark' : 'light',
  deviceScaleFactor: 1,
});
const errors = [];
page.on(
  'console',
  (m) =>
    (m.type() === 'error' || m.type() === 'warning') && errors.push(`[${m.type()}] ${m.text()}`),
);
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.screenshot({ path: out, fullPage: full });
const scroll = await page.evaluate(() => ({
  sw: document.documentElement.scrollWidth,
  cw: document.documentElement.clientWidth,
}));
console.log(JSON.stringify({ out, horizontalOverflow: scroll.sw > scroll.cw, ...scroll }));
for (const e of errors.slice(0, 20)) console.log(e);
await browser.close();
