import { expect, test } from '@playwright/test';
import { openScene, surfaceBox } from './helpers';

test.describe('pointer interactions', () => {
  test('hover shows a tooltip and crosshair; leaving hides them', async ({ page }) => {
    const errors = await openScene(page, 'gallery');
    const card = page.getByTestId('Line chart');
    const box = await surfaceBox(page, 'Line chart');
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4);
    const tooltip = card.locator('.jc-tooltip');
    await expect(tooltip).toHaveAttribute('data-visible', 'true');
    await expect(tooltip).toContainText('Students');
    await expect(card.locator('.jc-crosshair')).toHaveCount(1);
    // The tooltip never changes the container size.
    const before = await card.boundingBox();
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.4);
    expect(await card.boundingBox()).toEqual(before);
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveAttribute('data-visible', 'false');
    expect(errors).toEqual([]);
  });

  test('legend toggles series and the last one stays visible', async ({ page }) => {
    await openScene(page, 'gallery');
    const card = page.getByTestId('Grouped bar chart');
    await card.getByRole('button', { name: 'Open' }).click();
    await expect(card.locator('.jc-series')).toHaveCount(2);
    await card.getByRole('button', { name: 'Resolved' }).click();
    await expect(card.getByRole('button', { name: 'Rejected' })).toBeDisabled();
    await card.getByRole('button', { name: 'Open' }).click();
    await expect(card.locator('.jc-series')).toHaveCount(2);
  });

  test('keyboard navigation announces values', async ({ page }) => {
    await openScene(page, 'gallery');
    const card = page.getByTestId('Bar chart');
    await card.getByRole('img').focus();
    await page.keyboard.press('ArrowRight');
    await expect(card.locator('[aria-live]')).toContainText('Jan');
    await page.keyboard.press('End');
    await expect(card.locator('[aria-live]')).toContainText('Dec');
    await page.keyboard.press('Escape');
    await expect(card.locator('[aria-live]')).toHaveText('');
  });

  test('controlled state round-trips through callbacks', async ({ page }) => {
    await openScene(page, 'interactions');
    const card = page.getByTestId('controlled');
    await card.getByRole('button', { name: 'Teachers' }).click();
    await expect(page.getByTestId('state')).toContainText('hidden=teachers');
    const box = await surfaceBox(page, 'controlled');
    await page.mouse.click(box.x + box.width * 0.2, box.y + box.height * 0.6);
    await expect(page.getByTestId('state')).toContainText(/active=\d+;clicked=\d+:\w+/);
  });
});

test.describe('zoom, pan and brush', () => {
  test('ctrl + wheel zooms, drag pans, double click resets', async ({ page }) => {
    await openScene(page, 'interactions');
    const card = page.getByTestId('zoom');
    const box = await surfaceBox(page, 'zoom');
    const firstTick = async () =>
      card.locator('.jc-axis[data-position="bottom"] text').first().textContent();
    const initial = await firstTick();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.keyboard.down('Control');
    for (let i = 0; i < 5; i++) await page.mouse.wheel(0, -200);
    await page.keyboard.up('Control');
    await expect(card.getByRole('button', { name: 'Reset zoom' })).toBeVisible();
    const zoomed = await firstTick();
    expect(zoomed).not.toBe(initial);
    // Drag to pan.
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5, { steps: 5 });
    await page.mouse.up();
    expect(await firstTick()).not.toBe(zoomed);
    await page.mouse.dblclick(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await expect(card.getByRole('button', { name: 'Reset zoom' })).toHaveCount(0);
    expect(await firstTick()).toBe(initial);
  });

  test('plain wheel scrolls the page instead of zooming', async ({ page }) => {
    await openScene(page, 'interactions');
    const box = await surfaceBox(page, 'zoom');
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.wheel(0, -200);
    await expect(page.getByTestId('zoom').getByRole('button', { name: 'Reset zoom' })).toHaveCount(
      0,
    );
  });

  test('brush selection reports the selected index range', async ({ page }) => {
    await openScene(page, 'interactions');
    const box = await surfaceBox(page, 'brush');
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5, { steps: 6 });
    await expect(page.getByTestId('brush').locator('.jc-brush')).toHaveCount(1);
    await page.mouse.up();
    await expect(page.getByTestId('brush-result')).toHaveText(/^\d+-\d+$/);
    const [a, b] = (await page.getByTestId('brush-result').textContent())!.split('-').map(Number);
    expect(b! - a!).toBeGreaterThan(10);
  });
});
