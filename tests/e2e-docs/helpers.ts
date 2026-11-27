import type { Page } from '@playwright/test';

/**
 * Opens a docs page (`/charts/line-chart`, `/ru/…`) in a colour scheme with reduced
 * motion, waits for fonts and the first heading, and collects console errors.
 */
export async function openDocs(
  page: Page,
  path: string,
  { theme = 'light' }: { theme?: 'light' | 'dark' } = {},
): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
  await page.goto(`/#${path}`);
  await page.locator('main h1').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  return errors;
}

/** Every language-neutral route of the site. */
export const ROUTES = [
  '/',
  '/getting-started',
  '/installation',
  '/quick-start',
  '/charts',
  '/charts/line-chart',
  '/charts/area-chart',
  '/charts/bar-chart',
  '/charts/horizontal-bar-chart',
  '/charts/grouped-bar-chart',
  '/charts/stacked-bar-chart',
  '/charts/donut-chart',
  '/charts/pie-chart',
  '/charts/sparkline',
  '/charts/radial-progress-chart',
  '/charts/heatmap-chart',
  '/charts/radar-chart',
  '/charts/scatter-chart',
  '/charts/funnel-chart',
  '/charts/treemap-chart',
  '/charts/gauge-chart',
  '/charts/waterfall-chart',
  '/charts/combo-chart',
  '/charts/calendar-heatmap',
  '/charts/stacked-area-chart',
  '/components',
  '/themes',
  '/performance',
  '/playground',
  '/examples',
  '/api',
  '/changelog',
  '/github',
] as const;
