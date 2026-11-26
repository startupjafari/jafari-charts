import { expect, test } from '@playwright/test';
import { openScene } from './helpers';

test('Kazakh formatting works even where the browser ICU lacks kk data', async ({ page }) => {
  await openScene(page, 'polar', '&locale=kk');
  // Kazakh grouping uses a non-breaking space; "Барлығы" = Total.
  await expect(page.getByTestId('Donut chart').locator('.jc-center-value')).toHaveText('20 078');
  await expect(page.getByTestId('Donut chart').locator('.jc-center-label')).toHaveText('Барлығы');
  await openScene(page, 'gallery', '&locale=kk');
  const ticks = await page.getByTestId('Bar chart').locator('.jc-axis text').allTextContents();
  expect(ticks.join(' ')).not.toMatch(/M\d\d/);
  const lineTicks = await page
    .getByTestId('Area chart')
    .locator('.jc-axis[data-position="bottom"] text')
    .allTextContents();
  expect(lineTicks.some((t) => /ақп\.|нау\./.test(t))).toBe(true);
});

test('Russian formatting uses Russian month names and separators', async ({ page }) => {
  await openScene(page, 'gallery', '&locale=ru');
  const ticks = await page
    .getByTestId('Area chart')
    .locator('.jc-axis[data-position="bottom"] text')
    .allTextContents();
  expect(ticks.some((t) => /февр\.|мар\./.test(t))).toBe(true);
});
