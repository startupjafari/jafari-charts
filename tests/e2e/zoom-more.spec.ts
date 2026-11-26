import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { openScene, surfaceBox } from './helpers';

const ticks = (page: Page, id: string, position = 'bottom') =>
  page.getByTestId(id).locator(`.jc-axis[data-position="${position}"] text`).allTextContents();

async function ctrlWheel(page: Page, x: number, y: number, deltaY: number, times = 3) {
  await page.mouse.move(x, y);
  await page.keyboard.down('Control');
  for (let i = 0; i < times; i++) await page.mouse.wheel(0, deltaY);
  await page.keyboard.up('Control');
}

async function dragBetween(page: Page, from: [number, number], to: [number, number]) {
  await page.mouse.move(from[0], from[1]);
  await page.mouse.down();
  await page.mouse.move(to[0], to[1], { steps: 6 });
  await page.mouse.up();
}

test.describe('scatter zoom and brush', () => {
  test('Ctrl + wheel zooms both axes; a plain wheel does not; double click resets', async ({
    page,
  }) => {
    const errors = await openScene(page, 'zoom');
    const card = page.getByTestId('scatter');
    const domain = page.getByTestId('scatter-domain');
    const box = await surfaceBox(page, 'scatter');
    const before = await ticks(page, 'scatter');
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.4);
    await page.mouse.wheel(0, -200);
    await expect(domain).toHaveText('x full; y full');
    await ctrlWheel(page, box.x + box.width * 0.6, box.y + box.height * 0.4, -200);
    await expect(card.getByRole('button', { name: 'Reset zoom' })).toBeVisible();
    await expect(domain).not.toHaveText(/full/);
    expect(await ticks(page, 'scatter')).not.toEqual(before);
    await page.mouse.dblclick(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await expect(domain).toHaveText('x full; y full');
    await expect(card.getByRole('button', { name: 'Reset zoom' })).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('a rectangle brush selects points and zooms into them', async ({ page }) => {
    await openScene(page, 'zoom');
    const box = await surfaceBox(page, 'scatter');
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.6, { steps: 6 });
    await expect(page.getByTestId('scatter').locator('.jc-brush')).toHaveCount(1);
    await page.mouse.up();
    await expect(page.getByTestId('scatter').locator('.jc-brush')).toHaveCount(0);
    await expect(page.getByTestId('scatter-brush')).toHaveText(/^[1-9]\d*$/);
    await expect(page.getByTestId('scatter-domain')).not.toHaveText(/full/);
  });

  test('controlled domains come from outside', async ({ page }) => {
    await openScene(page, 'zoom');
    await page.getByRole('button', { name: 'Zoom to top performers' }).click();
    await expect(page.getByTestId('scatter-domain')).toHaveText('x 10.0–20.0; y 60.0–100.0');
    const xs = (await ticks(page, 'scatter')).map(Number).filter(Number.isFinite);
    expect(xs.length).toBeGreaterThan(1);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(10);
    expect(Math.max(...xs)).toBeLessThanOrEqual(20);
    await page.getByTestId('scatter').getByRole('button', { name: 'Reset zoom' }).click();
    await expect(page.getByTestId('scatter-domain')).toHaveText('x full; y full');
  });
});

test.describe('category window zoom', () => {
  test('Ctrl + wheel narrows the categories; a plain wheel scrolls the page', async ({ page }) => {
    await openScene(page, 'zoom');
    const range = page.getByTestId('bars-range');
    const box = await surfaceBox(page, 'bars');
    const all = await ticks(page, 'bars');
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await page.mouse.wheel(0, -200);
    await expect(range).toHaveText('all');
    await ctrlWheel(page, box.x + box.width * 0.5, box.y + box.height * 0.5, -200);
    await expect(range).toHaveText(/^\d+-\d+$/);
    const [s, e] = (await range.textContent())!.split('-').map(Number);
    expect(e! - s! + 1).toBeLessThan(24);
    // The window's categories fill the plot: its first label leads the axis.
    expect((await ticks(page, 'bars'))[0]).not.toBe(all[0]);
    await page.getByTestId('bars').getByRole('button', { name: 'Reset zoom' }).click();
    await expect(range).toHaveText('all');
  });

  test('keyboard zoom, Shift + arrow pan and drag pan move whole categories', async ({ page }) => {
    await openScene(page, 'zoom');
    const card = page.getByTestId('bars');
    const range = page.getByTestId('bars-range');
    await page.getByRole('button', { name: 'Last 6 months' }).click();
    await expect(range).toHaveText('18-23');
    expect(await ticks(page, 'bars')).toEqual([
      'Jul 25',
      'Aug 25',
      'Sep 25',
      'Oct 25',
      'Nov 25',
      'Dec 25',
    ]);
    await card.getByRole('img').focus();
    await page.keyboard.press('Shift+ArrowLeft');
    await expect(range).toHaveText('17-22');
    await expect(card.locator('[aria-live]')).toHaveText('Showing Jun 25 – Nov 25');
    await page.keyboard.press('0');
    await expect(range).toHaveText('all');
    await page.keyboard.press('+');
    await expect(range).not.toHaveText('all');
    await page.getByRole('button', { name: 'Last 6 months' }).click();
    const box = await surfaceBox(page, 'bars');
    await dragBetween(
      page,
      [box.x + box.width * 0.3, box.y + box.height * 0.5],
      [box.x + box.width * 0.75, box.y + box.height * 0.5],
    );
    const [s, e] = (await range.textContent())!.split('-').map(Number);
    expect(s).toBeLessThan(18);
    expect(e! - s!).toBe(5);
  });

  test('brushing stacked bars reports the category range', async ({ page }) => {
    await openScene(page, 'zoom');
    const box = await surfaceBox(page, 'bar-brush');
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5, { steps: 6 });
    await expect(page.getByTestId('bar-brush').locator('.jc-brush')).toHaveCount(1);
    await page.mouse.up();
    const text = page.getByTestId('bar-brush-result');
    await expect(text).toHaveText(/^\w{3} \d\d–\w{3} \d\d \(\d+-\d+\)$/);
    const [, a, b] = /\((\d+)-(\d+)\)/.exec((await text.textContent())!)!;
    expect(Number(b) - Number(a)).toBeGreaterThan(3);
  });

  test('a combo chart brush zooms into the selection', async ({ page }) => {
    await openScene(page, 'zoom');
    const box = await surfaceBox(page, 'combo');
    await dragBetween(
      page,
      [box.x + box.width * 0.3, box.y + box.height * 0.5],
      [box.x + box.width * 0.6, box.y + box.height * 0.5],
    );
    await expect(page.getByTestId('combo-range')).toHaveText(/^\d+-\d+$/);
    await expect(
      page.getByTestId('combo').getByRole('button', { name: 'Reset zoom' }),
    ).toBeVisible();
    const [s, e] = (await page.getByTestId('combo-range').textContent())!.split('-').map(Number);
    expect((await ticks(page, 'combo')).length).toBeLessThanOrEqual(e! - s! + 1);
  });
});

test.describe('calendar selection and controlled active day', () => {
  test('dragging selects a day range and highlights it', async ({ page }) => {
    await openScene(page, 'zoom');
    const card = page.getByTestId('calendar');
    await card.scrollIntoViewIfNeeded();
    const box = await surfaceBox(page, 'calendar');
    await dragBetween(
      page,
      [box.x + box.width * 0.3, box.y + box.height * 0.45],
      [box.x + box.width * 0.45, box.y + box.height * 0.6],
    );
    const text = page.getByTestId('calendar-range');
    await expect(text).toHaveText(/^2025-\d\d-\d\d\.\.2025-\d\d-\d\d$/);
    const [from, to] = (await text.textContent())!.split('..');
    expect(from! < to!).toBe(true);
    await expect(card.locator('.jc-selection path')).toHaveCount(1);
  });

  test('Shift + arrows extend a selection from the keyboard', async ({ page }) => {
    await openScene(page, 'zoom');
    const card = page.getByTestId('calendar');
    await card.getByRole('img').focus();
    await page.keyboard.press('Home');
    await expect(page.getByTestId('calendar-active')).toHaveText('2025-01-01');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await expect(page.getByTestId('calendar-range')).toHaveText('2025-01-01..2025-01-15');
    await expect(page.getByTestId('calendar-active')).toHaveText('2025-01-15');
    await expect(card.locator('[aria-live]')).toHaveText(
      'Selected Wed, Jan 1, 2025 – Wed, Jan 15, 2025',
    );
    await page.keyboard.press('Escape');
    await expect(card.locator('.jc-selection')).toHaveCount(0);
  });

  test('the active day follows the controlled prop', async ({ page }) => {
    await openScene(page, 'zoom');
    await page.getByRole('button', { name: 'Highlight Jun 1' }).click();
    await expect(page.getByTestId('calendar-active')).toHaveText('2025-06-01');
    const tooltip = page.getByTestId('calendar').locator('.jc-tooltip');
    await expect(tooltip).toHaveAttribute('data-visible', 'true');
    await expect(tooltip).toContainText('Jun 1, 2025');
  });
});

test.describe('treemap controlled drill-down', () => {
  test('the path drives the view and navigation reports back', async ({ page }) => {
    await openScene(page, 'zoom');
    const card = page.getByTestId('treemap');
    const path = page.getByTestId('treemap-path');
    await page.getByRole('button', { name: 'Show Engineering' }).click();
    await expect(path).toHaveText('Academics / Engineering');
    await expect(card.locator('nav [aria-current]')).toHaveText('Engineering');
    await card.getByRole('button', { name: /Back/ }).click();
    await expect(path).toHaveText('Academics');
    await expect(card.locator('nav [aria-current]')).toHaveText('Academics');
    await page.getByRole('button', { name: 'Whole university' }).click();
    await expect(path).toHaveText('root');
    await expect(card.locator('nav')).toHaveCount(0);
  });
});

test('zoomed, drilled and selected states have no serious accessibility violations', async ({
  page,
}) => {
  await openScene(page, 'zoom');
  await page.getByRole('button', { name: 'Zoom to top performers' }).click();
  await page.getByRole('button', { name: 'Last 6 months' }).click();
  await page.getByRole('button', { name: 'Show Engineering' }).click();
  const calendar = page.getByTestId('calendar').getByRole('img');
  await calendar.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('Shift+ArrowRight');
  // The reset controls are real buttons outside the chart image.
  const reset = page.getByTestId('bars').getByRole('button', { name: 'Reset zoom' });
  await expect(reset).toBeVisible();
  expect(await reset.evaluate((b) => b.closest('[role="img"]'))).toBeNull();
  const results = await new AxeBuilder({ page }).include('.jc-root').analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(serious.map((v) => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
});
