import { expect, test } from '@playwright/test';
import { openScene } from './helpers';

test.describe('export module', () => {
  test.beforeEach(async ({ page }) => {
    await openScene(page, 'export');
    await page.waitForFunction(() => Boolean(window.__export));
  });

  test('SVG export is standalone: inline styles, resolved colours, legend, background', async ({
    page,
  }) => {
    const result = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="svg-chart"] .jc-root') as Element;
      const { svg, width, height } = window.__export!.chartToSvg(el, { background: 'light' });
      return { svg, width, height };
    });
    expect(result.svg.startsWith('<svg')).toBe(true);
    expect(result.svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(result.svg).not.toContain('var(--'); // colours resolved to real values
    expect(result.svg).not.toContain('class="'); // no dependency on page CSS
    expect(result.svg).toContain('fill="#ffffff"'); // requested background
    expect(result.svg).toContain('Students'); // legend redrawn as SVG
    expect(result.width).toBeGreaterThan(300);
    // The file parses as a valid SVG document.
    const ok = await page.evaluate(
      (s) => !new DOMParser().parseFromString(s, 'image/svg+xml').querySelector('parsererror'),
      result.svg,
    );
    expect(ok).toBe(true);
  });

  test('PNG export honours the scale factor and transparency', async ({ page }) => {
    const sizes = await page.evaluate(async () => {
      const el = document.querySelector('[data-testid="svg-chart"] .jc-root') as Element;
      const base = window.__export!.chartToSvg(el);
      const out: Array<{
        scale: number;
        w: number;
        h: number;
        expectedW: number;
        type: string;
        alpha: number;
      }> = [];
      for (const scale of [1, 2, 3]) {
        const blob = await window.__export!.toPngBlob(el, { scale, background: 'transparent' });
        const bitmap = await createImageBitmap(blob);
        const c = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = c.getContext('2d') as OffscreenCanvasRenderingContext2D;
        ctx.drawImage(bitmap, 0, 0);
        const alpha = ctx.getImageData(1, 1, 1, 1).data[3] as number; // corner pixel: transparent
        out.push({
          scale,
          w: bitmap.width,
          h: bitmap.height,
          expectedW: Math.round(base.width * scale),
          type: blob.type,
          alpha,
        });
      }
      return out;
    });
    for (const s of sizes) {
      expect(s.type).toBe('image/png');
      expect(s.w).toBe(s.expectedW);
      expect(s.alpha).toBe(0);
    }
  });

  test('canvas-rendered charts are embedded in the export', async ({ page }) => {
    await page.waitForFunction(() =>
      document.querySelector('[data-testid="canvas-chart"] canvas.jc-canvas'),
    );
    await page.waitForTimeout(300); // lazy canvas renderer
    const svg = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="canvas-chart"] .jc-root') as Element;
      return window.__export!.chartToSvg(el).svg;
    });
    expect(svg).toContain('<image');
    expect(svg).toContain('data:image/png;base64,');
  });

  test('WebP export works where the browser can encode WebP', async ({ page, browserName }) => {
    const result = await page.evaluate(async () => {
      if (!window.__export!.isWebpSupported()) return { supported: false, type: '' };
      const el = document.querySelector('[data-testid="svg-chart"] .jc-root') as Element;
      const blob = await window.__export!.toWebpBlob(el, { scale: 1, quality: 0.9 });
      return { supported: true, type: blob.type };
    });
    if (browserName === 'chromium') expect(result.supported).toBe(true);
    if (result.supported) expect(result.type).toBe('image/webp');
  });

  test('CSV export quotes, neutralises formulas and keeps Cyrillic', async ({ page }) => {
    const csv = await page.evaluate(() =>
      window.__export!.toCsv([
        { name: 'Студенты, 1 курс', value: 12.5, note: '=SUM(A1)' },
        { name: 'He said "hi"', value: null, note: '-5' },
      ]),
    );
    expect(csv.charCodeAt(0)).toBe(0xfeff); // BOM for Excel
    const lines = csv.slice(1).trim().split('\r\n');
    expect(lines[0]).toBe('name,value,note');
    expect(lines[1]).toBe('"Студенты, 1 курс",12.5,\'=SUM(A1)');
    expect(lines[2]).toBe('"He said ""hi""",,-5');
  });

  test('exportChart triggers a download with the requested file name', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.evaluate(() => {
        const el = document.querySelector('[data-testid="svg-chart"] .jc-root') as Element;
        return window
          .__export!.exportChart(el, { format: 'svg', filename: 'growth' })
          .then(() => undefined);
      }),
    ]);
    expect(download.suggestedFilename()).toBe('growth.svg');
  });
});
