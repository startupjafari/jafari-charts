import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openScene } from './helpers';

for (const scene of [
  'gallery',
  'polar',
  'interactions',
  'heatmap',
  'scatter',
  'radar',
  'funnel',
  'treemap',
]) {
  for (const theme of ['light', 'dark']) {
    test(`${scene} (${theme}) has no serious accessibility violations`, async ({ page }) => {
      await openScene(page, scene, theme === 'dark' ? '&theme=dark' : '');
      const results = await new AxeBuilder({ page }).include('.jc-root').analyze();
      const serious = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      expect(serious.map((v) => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
    });
  }
}

test('every chart exposes a name, a description and a keyboard-focusable surface', async ({
  page,
}) => {
  await openScene(page, 'gallery');
  const surfaces = page.locator('.jc-layers[role="img"]');
  const count = await surfaces.count();
  expect(count).toBeGreaterThan(5);
  for (let i = 0; i < count; i++) {
    const s = surfaces.nth(i);
    await expect(s).toHaveAttribute('tabindex', '0');
    const describedBy = await s.getAttribute('aria-describedby');
    await expect(page.locator(`[id="${describedBy}"]`)).toContainText(/chart|Sparkline/i);
  }
});
