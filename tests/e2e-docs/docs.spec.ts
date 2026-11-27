import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openDocs, ROUTES } from './helpers';

test.describe('every page renders', () => {
  test.skip(({ isMobile }) => isMobile, 'Route sweep runs once, on desktop.');
  for (const path of ROUTES) {
    test(`${path} (en and ru)`, async ({ page }) => {
      const errors = await openDocs(page, path);
      await expect(page.locator('main h1').first()).toBeVisible();
      await openDocs(page, path === '/' ? '/ru' : `/ru${path}`);
      await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
      expect(errors).toEqual([]);
    });
  }

  test('unknown paths show the not-found page', async ({ page }) => {
    await openDocs(page, '/no-such-page');
    await expect(page.locator('main h1')).toHaveText('Page not found');
  });
});

test.describe('desktop shell', () => {
  test.skip(({ isMobile }) => isMobile, 'Desktop sidebar and rail.');

  test('sidebar marks the current page and filters entries', async ({ page }) => {
    await openDocs(page, '/charts/bar-chart');
    const nav = page.getByRole('navigation', { name: 'Documentation' });
    await expect(nav.getByRole('link', { name: 'BarChart', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await page.keyboard.press('/');
    const filter = page.getByRole('searchbox', { name: 'Filter pages' });
    await expect(filter).toBeFocused();
    await filter.fill('gauge');
    await expect(nav.getByRole('link')).toHaveCount(1);
    await expect(nav.getByRole('link', { name: 'GaugeChart' })).toBeVisible();
    await filter.fill('zzzz');
    await expect(nav).toContainText('No pages match');
    await filter.press('Escape');
    await expect(filter).toHaveValue('');
  });

  test('“On this page” lists the sections and follows the reader', async ({ page }) => {
    await openDocs(page, '/charts/line-chart');
    const toc = page.getByRole('navigation', { name: 'On this page' }).last();
    await expect(toc.getByRole('link')).toHaveText([
      'Usage',
      'Styling variants',
      'Interaction',
      'Responsive',
      'Empty, loading and error states',
      'Props',
    ]);
    await toc.getByRole('link', { name: 'Props' }).click();
    await expect(page).toHaveURL(/#\/charts\/line-chart#props$/);
    await expect(toc.getByRole('link', { name: 'Props' })).toHaveAttribute(
      'aria-current',
      'location',
    );
  });

  test('previous and next links follow the sidebar order', async ({ page }) => {
    await openDocs(page, '/installation');
    const pager = page.getByRole('navigation', { name: 'Previous and next page' });
    await expect(pager.getByRole('link')).toHaveText([/Introduction/, /Quick start/]);
  });
});

test('theme switch: light, dark and system', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The top-bar switch is desktop-only (phones use the drawer).');
  await openDocs(page, '/getting-started', { theme: 'light' });
  const html = page.locator('html');
  const theme = page.getByRole('group', { name: 'Colour theme' });
  await theme.getByRole('button', { name: 'Dark' }).click();
  await expect(html).toHaveClass(/dark/);
  await page.reload();
  await expect(html).toHaveClass(/dark/);
  await theme.getByRole('button', { name: 'System' }).click();
  await expect(html).not.toHaveClass(/dark/);
  await expect(theme.getByRole('button', { name: 'System' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('language switch keeps the page', async ({ page }) => {
  await openDocs(page, '/charts/pie-chart');
  await page
    .getByRole('group', { name: 'Language' })
    .first()
    .getByRole('button', { name: 'RU' })
    .click();
  await expect(page).toHaveURL(/#\/ru\/charts\/pie-chart$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.getByRole('tab', { name: 'Код' }).first()).toBeVisible();
});

test('examples switch between preview and code, and code can be copied', async ({ page }) => {
  await openDocs(page, '/charts/bar-chart');
  const example = page.locator('section.example').first();
  await expect(example.locator('.jc-root').first()).toBeVisible();
  await example.getByRole('tab', { name: 'Code' }).click();
  await expect(example.locator('pre')).toContainText('BarChart');
  await expect(example.locator('.jc-root').first()).toBeHidden();
  await example.getByRole('button', { name: 'Copy' }).click();
  await expect(example.getByRole('button', { name: /Copied|Copy failed/ })).toBeVisible();
  await example.getByRole('tab', { name: 'Preview' }).click();
  await expect(example.locator('.jc-root').first()).toBeVisible();
});

test('charts follow the site theme', async ({ page }) => {
  await openDocs(page, '/charts/line-chart', { theme: 'dark' });
  const bg = await page
    .locator('section.example .jc-root')
    .first()
    .evaluate((el) => getComputedStyle(el).getPropertyValue('--jc-bg').trim().toLowerCase());
  expect(bg).toBe('#0f1115');
});

test.describe('phone layout', () => {
  test.skip(({ isMobile }) => !isMobile, 'Phone only.');

  test('the sidebar is a drawer: opens, traps focus, closes with Escape and after navigating', async ({
    page,
  }) => {
    await openDocs(page, '/getting-started');
    await expect(page.getByRole('navigation', { name: 'Documentation' })).toBeHidden();
    await page.getByRole('button', { name: 'Open navigation' }).click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await drawer.getByRole('link', { name: 'DonutChart' }).click();
    await expect(page).toHaveURL(/#\/charts\/donut-chart$/);
    await expect(drawer).toBeHidden();
  });

  test('no page scrolls sideways at phone width', async ({ page }) => {
    for (const path of ['/', '/charts/line-chart', '/api', '/playground', '/performance']) {
      await openDocs(page, path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

for (const theme of ['light', 'dark'] as const) {
  for (const path of ['/', '/charts/line-chart', '/installation']) {
    test(`${path} (${theme}) has no serious accessibility violations`, async ({
      page,
      isMobile,
    }) => {
      test.skip(isMobile, 'Desktop only.');
      await openDocs(page, path, { theme });
      const results = await new AxeBuilder({ page }).exclude('.jc-root').analyze();
      const serious = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      expect(
        serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
      ).toEqual([]);
    });
  }
}
