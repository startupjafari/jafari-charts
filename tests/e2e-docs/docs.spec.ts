import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openDocs, ROUTES } from './helpers';

test.describe('every page renders', () => {
  test.skip(({ isMobile }) => isMobile, 'Route sweep runs once, on desktop.');
  for (const path of ROUTES) {
    test(`${path} (en, ru and kk)`, async ({ page }) => {
      const errors = await openDocs(page, path);
      await expect(page.locator('main h1').first()).toBeVisible();
      for (const lang of ['ru', 'kk']) {
        await openDocs(page, path === '/' ? `/${lang}` : `/${lang}${path}`);
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        await expect(page.locator('main h1').first()).toBeVisible();
      }
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

test('theme select: light, dark and system', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The top-bar select is desktop-only (phones use the drawer).');
  await openDocs(page, '/getting-started', { theme: 'light' });
  const html = page.locator('html');
  const theme = page.getByRole('combobox', { name: 'Colour theme' });
  await expect(theme).toHaveText('System');
  await theme.click();
  // StudentHub's theme select order.
  await expect(page.getByRole('option')).toHaveText(['System', 'Light', 'Dark']);
  await page.getByRole('option', { name: 'Dark' }).click();
  await expect(html).toHaveClass(/dark/);
  await page.reload();
  await expect(html).toHaveClass(/dark/);
  await expect(theme).toHaveText('Dark');
  // Keyboard: open with Enter, move with the arrows, pick with Enter.
  await theme.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('option', { name: 'Dark' })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('option', { name: 'Light' })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('option', { name: 'System' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(html).not.toHaveClass(/dark/);
  await expect(theme).toHaveText('System');
  await expect(theme).toBeFocused();
});

test('language select keeps the page', async ({ page }) => {
  await openDocs(page, '/charts/pie-chart');
  await page.getByRole('combobox', { name: 'Language' }).first().click();
  await page.getByRole('option', { name: 'Русский' }).click();
  await expect(page).toHaveURL(/#\/ru\/charts\/pie-chart$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.getByRole('tab', { name: 'Код' }).first()).toBeVisible();
});

test.describe('Kazakh', () => {
  test('the switch opens the same page in Kazakh and the choice sticks', async ({ page }) => {
    await openDocs(page, '/charts/pie-chart');
    const switcher = page.getByRole('combobox', { name: 'Language' }).first();
    await expect(switcher).toHaveText('English');
    await switcher.click();
    // StudentHub's order and endonyms.
    await expect(page.getByRole('option')).toHaveText(['Русский', 'Қазақша', 'English']);
    await page.getByRole('option', { name: 'Қазақша' }).click();
    await expect(page).toHaveURL(/#\/kk\/charts\/pie-chart$/);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'kk');
    await expect(page).toHaveTitle('PieChart · Jafari Charts');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /нөлден жазылған диаграммалар кітапханасы/,
    );
    await expect(page.getByText('Қашан қолдану керек', { exact: true })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Тіл' }).first()).toHaveText('Қазақша');
    // An unprefixed link now follows the stored choice.
    await page.goto('/#/installation');
    await expect(page).toHaveURL(/#\/kk\/installation$/);
    await expect(page.locator('main h1')).toHaveText('Орнату');
    await expect(page).toHaveTitle('Орнату · Jafari Charts');
    // And back to English.
    await page.getByRole('combobox', { name: 'Тіл' }).first().click();
    await page.getByRole('option', { name: 'English' }).click();
    await expect(page).toHaveURL(/#\/installation$/);
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('live charts use the Kazakh locale', async ({ page }) => {
    await openDocs(page, '/kk/charts/bar-chart');
    const chart = page.locator('section.example .jc-root').first();
    await expect(chart.locator('table caption')).toHaveText(/^Деректер кестесі/);
    await expect(page.getByRole('tab', { name: 'Алдын ала көру' }).first()).toBeVisible();
  });

  test('the phone drawer switches to Қазақша', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Phone only.');
    await openDocs(page, '/getting-started');
    await page.getByRole('button', { name: 'Open navigation' }).click();
    const drawer = page.getByRole('dialog');
    await drawer.getByRole('combobox', { name: 'Language' }).click();
    await expect(page.getByRole('option')).toHaveText(['Русский', 'Қазақша', 'English']);
    await page.getByRole('option', { name: 'Қазақша' }).click();
    await expect(page).toHaveURL(/#\/kk\/getting-started$/);
    await expect(drawer.getByRole('link', { name: 'Жылдам бастау' })).toBeVisible();
  });

  const DETECTION = [
    { languages: ['kk-KZ', 'ru-RU', 'en'], expected: 'kk' },
    { languages: ['kz'], expected: 'kk' },
    { languages: ['ru-RU', 'kk'], expected: 'ru' },
    { languages: ['en-US', 'kk'], expected: 'en' },
    { languages: ['de-DE'], expected: 'en' },
  ] as const;
  for (const { languages, expected } of DETECTION) {
    test(`browser languages ${languages.join(', ')} → ${expected}`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'Detection runs once, on desktop.');
      await page.addInitScript((list) => {
        Object.defineProperty(navigator, 'languages', { get: () => list });
        Object.defineProperty(navigator, 'language', { get: () => list[0] });
      }, languages);
      await openDocs(page, '/charts/line-chart');
      await expect(page.locator('html')).toHaveAttribute('lang', expected);
      await expect(page).toHaveURL(
        expected === 'en'
          ? /#\/charts\/line-chart$/
          : new RegExp(`#/${expected}/charts/line-chart$`),
      );
    });
  }
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
  // Toolbar: StudentHub's SegmentedTabs (pressed buttons) for the preview theme and width.
  const theme = example.getByRole('group', { name: /^Preview theme/ });
  await theme.getByRole('button', { name: 'Dark' }).click();
  await expect(theme.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
  await expect(example.locator('.example-preview')).toHaveAttribute('data-preview-theme', 'dark');
  await example
    .getByRole('group', { name: /^Preview width/ })
    .getByRole('button', { name: '320' })
    .click();
  await expect(example.locator('.example-stage')).toHaveAttribute('data-width', '320');
});

test('props groups expand and collapse with their toggle button', async ({ page }) => {
  await openDocs(page, '/charts/bar-chart');
  const group = page.locator('[data-prop-group]').nth(2);
  const toggle = group.getByRole('button').first();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(group.locator('table')).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(group.locator('table')).toBeVisible();
  await toggle.press('Enter');
  await expect(group.locator('table')).toBeHidden();
});

test('playground controls drive the chart and the code', async ({ page }) => {
  await openDocs(page, '/playground');
  const form = page.getByRole('form', { name: 'Chart configuration' });
  const code = page.locator('.codeblock pre');
  await form.getByRole('combobox', { name: 'Chart type' }).click();
  await page.getByRole('option', { name: 'Bar (BarChart)' }).click();
  await expect(code).toContainText('<BarChart');
  await form
    .getByRole('group', { name: 'Renderer' })
    .getByRole('button', { name: 'Canvas' })
    .click();
  await expect(code).toContainText('renderer="canvas"');
  const animation = form.getByRole('switch', { name: 'Animation' });
  await expect(animation).toHaveAttribute('aria-checked', 'true');
  await animation.click();
  await expect(animation).toHaveAttribute('aria-checked', 'false');
  await expect(code).toContainText('animation={false}');
  await form.getByRole('button', { name: 'Reset' }).click();
  await expect(form.getByRole('combobox', { name: 'Chart type' })).toHaveText('Line (LineChart)');
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
    const paths = ['/', '/charts/line-chart', '/api', '/playground', '/performance'];
    // Kazakh has the longest strings (chart-page tags, table headers, buttons).
    const kk = ['/kk', '/kk/charts/grouped-bar-chart', '/kk/components', '/kk/performance'];
    for (const path of [...paths, ...kk]) {
      await openDocs(page, path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

for (const theme of ['light', 'dark'] as const) {
  for (const path of ['/', '/charts/line-chart', '/installation', '/kk', '/kk/charts/line-chart']) {
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
