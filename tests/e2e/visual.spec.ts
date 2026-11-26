import { expect, test } from '@playwright/test';
import { openScene } from './helpers';

const scenes = {
  gallery: [
    'Area chart',
    'Line chart',
    'Bar chart',
    'Bar chart (negative)',
    'Horizontal bar chart',
    'Grouped bar chart',
    'Stacked bar chart',
    'Stacked bar chart (percent)',
    'Stacked area chart',
    'Combo chart',
    'Waterfall chart',
    'Sparklines',
  ],
  polar: [
    'Donut chart',
    'Pie chart',
    'Pie chart (outside labels)',
    'Radial progress',
    'Gauge chart',
  ],
};

for (const theme of ['light', 'dark'] as const) {
  for (const [scene, cards] of Object.entries(scenes)) {
    test(`@visual ${scene} renders consistently (${theme})`, async ({ page }) => {
      await openScene(page, scene, theme === 'dark' ? '&theme=dark' : '');
      await page.evaluate(() => document.fonts.ready);
      for (const card of cards) {
        await expect(page.getByTestId(card)).toHaveScreenshot(
          `${scene}-${card.replace(/\W+/g, '-').toLowerCase()}-${theme}.png`,
        );
      }
    });
  }
}

// Newer scenes: every card is a baseline (cards are identified by position).
for (const theme of ['light', 'dark'] as const) {
  for (const scene of ['heatmap', 'scatter', 'radar', 'funnel', 'treemap']) {
    test(`@visual ${scene} cards render consistently (${theme})`, async ({ page }) => {
      await openScene(page, scene, theme === 'dark' ? '&theme=dark' : '');
      await page.evaluate(() => document.fonts.ready);
      const cards = page.locator('section.card, .card');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(cards.nth(i)).toHaveScreenshot(`${scene}-${i}-${theme}.png`);
      }
    });
  }
}
