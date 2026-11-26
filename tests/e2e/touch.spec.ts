import { expect, test } from '@playwright/test';
import { openScene, surfaceBox } from './helpers';

test('tap shows the tooltip above the finger and a tap outside dismisses it', async ({ page }) => {
  await openScene(page, 'gallery');
  const card = page.getByTestId('Bar chart');
  await card.scrollIntoViewIfNeeded();
  const box = await surfaceBox(page, 'Bar chart');
  await page.touchscreen.tap(box.x + box.width * 0.5, box.y + box.height * 0.6);
  const tooltip = card.locator('.jc-tooltip');
  await expect(tooltip).toHaveAttribute('data-visible', 'true');
  const tip = await tooltip.boundingBox();
  expect(tip!.y + tip!.height).toBeLessThan(box.y + box.height * 0.6);
  await page.touchscreen.tap(5, 5);
  await expect(tooltip).toHaveAttribute('data-visible', 'false');
});
