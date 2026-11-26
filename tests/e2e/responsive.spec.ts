import { expect, test } from '@playwright/test';
import { openScene } from './helpers';

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`no horizontal overflow and no clipped charts at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const scene of ['gallery', 'polar', 'heatmap', 'scatter', 'radar', 'funnel', 'treemap']) {
      const errors = await openScene(page, scene);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `${scene} overflows at ${width}px`).toBeLessThanOrEqual(0);
      // Every chart surface fits inside its card.
      const misfits = await page.evaluate(
        () =>
          Array.from(document.querySelectorAll('.card')).filter((card) => {
            const c = card.getBoundingClientRect();
            return Array.from(card.querySelectorAll('svg.jc-surface')).some(
              (s) => s.getBoundingClientRect().right > c.right + 1,
            );
          }).length,
      );
      expect(misfits).toBe(0);
      expect(errors).toEqual([]);
    }
  });
}
