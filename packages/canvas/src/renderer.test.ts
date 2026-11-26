import type { Mark } from '@jafari/charts-core';
import { describe, expect, it } from 'vitest';
import { CanvasRenderer } from './renderer';

/** Minimal recording stand-in for CanvasRenderingContext2D. */
function fakeCanvas() {
  const calls: string[] = [];
  const ctx = new Proxy(
    {
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1,
      lineWidth: 1,
      lineJoin: '',
      lineCap: '',
    } as Record<string, unknown>,
    {
      get(target, prop: string) {
        if (prop in target) return target[prop];
        if (prop === 'createLinearGradient')
          return () => ({ addColorStop: (o: number, c: string) => calls.push(`stop:${o}:${c}`) });
        return (...args: unknown[]) =>
          calls.push(`${prop}${prop === 'setTransform' ? `:${args[0]}` : ''}`);
      },
      set(target, prop: string, value) {
        target[prop] = value;
        if (prop === 'fillStyle' && typeof value === 'string') calls.push(`fillStyle:${value}`);
        return true;
      },
    },
  );
  const canvas = {
    width: 0,
    height: 0,
    style: {} as Record<string, string>,
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement;
  return { canvas, calls };
}

const bars = (n: number, fill = '#3b82f6'): Mark[] =>
  Array.from({ length: n }, (_, i) => ({
    type: 'rect',
    key: `b${i}`,
    x: i,
    y: 0,
    width: 1,
    height: 10,
    fill,
  }));

describe('CanvasRenderer', () => {
  it('caps the pixel ratio and the backing-store size', () => {
    const { canvas } = fakeCanvas();
    const r = new CanvasRenderer(canvas);
    r.resize(400, 300, 3);
    expect(r.pixelRatio).toBe(2);
    expect([canvas.width, canvas.height]).toEqual([800, 600]);
    const huge = new CanvasRenderer(fakeCanvas().canvas, { maxPixels: 1_000_000 });
    huge.resize(2000, 2000, 2);
    expect(huge.pixelRatio).toBe(0.5);
  });

  it('merges same-style marks but flushes every 64 subpaths', () => {
    const { canvas, calls } = fakeCanvas();
    const r = new CanvasRenderer(canvas);
    r.resize(100, 100, 1);
    r.render(bars(1000));
    expect(calls.filter((c) => c === 'fill')).toHaveLength(16); // ceil(1000 / 64)
  });

  it('starts a new batch when the style changes and chunks large point batches', () => {
    const { canvas, calls } = fakeCanvas();
    const r = new CanvasRenderer(canvas);
    r.resize(100, 100, 1);
    const points: Mark = {
      type: 'symbol',
      key: 'p',
      xs: Float64Array.from({ length: 600 }, (_, i) => i),
      ys: new Float64Array(600),
      size: 4,
      shape: 'circle',
      fill: '#ff0000',
    };
    r.render([...bars(2, '#111111'), ...bars(2, '#222222'), points]);
    expect(calls.filter((c) => c === 'fill')).toHaveLength(2 + 10); // two styles + ceil(600 / 64)
  });

  it('resolves theme colours and draws gradients with stop opacity', () => {
    const { canvas, calls } = fakeCanvas();
    const r = new CanvasRenderer(canvas);
    r.resize(100, 100, 1);
    r.render(
      [
        bars(1, 'var(--jc-series-1)')[0] as Mark,
        {
          type: 'area',
          key: 'a',
          xs: Float64Array.of(0, 10),
          y1s: Float64Array.of(0, 5),
          y0s: 10,
          curve: 'linear',
          fill: {
            type: 'linear-gradient',
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 10,
            stops: [{ offset: 0, color: '#000000', opacity: 0.5 }],
          },
        },
      ],
      { resolveColor: (c) => (c === 'var(--jc-series-1)' ? '#123456' : c) },
    );
    expect(calls).toContain('fillStyle:#123456');
    expect(calls).toContain('stop:0:rgba(0,0,0,0.5)');
  });
});
