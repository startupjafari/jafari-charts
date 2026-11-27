import { expect, test, type Page } from '@playwright/test';
import { openDocs } from './helpers';

/** Live charts settle after their first frame; give them a moment before the screenshot. */
async function settle(page: Page) {
  await page.waitForTimeout(400);
}

for (const theme of ['light', 'dark'] as const) {
  test(`@visual home (${theme})`, async ({ page }) => {
    await openDocs(page, '/', { theme });
    await settle(page);
    await expect(page).toHaveScreenshot(`home-${theme}.png`);
  });

  test(`@visual chart page header (${theme})`, async ({ page }) => {
    await openDocs(page, '/charts/line-chart', { theme });
    await settle(page);
    await expect(page).toHaveScreenshot(`line-chart-${theme}.png`);
  });

  test(`@visual example and props table (${theme})`, async ({ page }) => {
    await openDocs(page, '/charts/bar-chart', { theme });
    await settle(page);
    await expect(page.locator('section.example').first()).toHaveScreenshot(
      `bar-chart-example-${theme}.png`,
    );
    const props = page.locator('details').first();
    await props.scrollIntoViewIfNeeded();
    await expect(props.locator('tbody tr').first()).toHaveScreenshot(`props-row-${theme}.png`);
  });
}

test('@visual phone drawer (dark)', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Phone only.');
  await openDocs(page, '/charts/donut-chart', { theme: 'dark' });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('dialog').waitFor();
  await settle(page);
  await expect(page).toHaveScreenshot('drawer-dark.png');
});
