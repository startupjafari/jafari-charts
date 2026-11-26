import { describe, expect, it } from 'vitest';
import { batchMarks } from '../scene/draw';
import type { Mark } from '../scene/marks';
import {
  buildHeatmapModel,
  resolveHeatmapColors,
  sortHeatmapCells,
  type HeatmapSpec,
} from './heatmap';

const f = (...v: number[]) => Float64Array.from(v);

/** Elements the SVG renderer emits: marks grouped by series, then same-style batches. */
function pathCount(marks: readonly Mark[]): number {
  const groups = new Map<number, Mark[]>();
  for (const m of marks) groups.set(m.series ?? -1, [...(groups.get(m.series ?? -1) ?? []), m]);
  let n = 0;
  for (const g of groups.values()) n += batchMarks(g).length;
  return n;
}

const grid = (nx: number, ny: number, fn: (x: number, y: number) => number): HeatmapSpec => ({
  width: 600,
  height: 400,
  xLabels: Array.from({ length: nx }, (_, i) => `x${i}`),
  yLabels: Array.from({ length: ny }, (_, i) => `y${i}`),
  values: Float64Array.from({ length: nx * ny }, (_, i) => fn(i % nx, Math.floor(i / nx))),
});

describe('resolveHeatmapColors', () => {
  it('quantizes the data extent into equal steps of one hue', () => {
    const s = resolveHeatmapColors(f(0, 25, 50, 75, 100));
    expect(s.buckets).toHaveLength(5);
    expect(s.domain).toEqual([0, 100]);
    expect([0, 19.9, 20, 50, 99, 100].map(s.bucketOf)).toEqual([0, 0, 1, 2, 4, 4]);
    expect(s.buckets.every((b) => b.fill === 'var(--jc-series-1)')).toBe(true);
    expect(s.buckets.map((b) => b.fillOpacity)).toEqual([0.2, 0.4, 0.6, 0.8, undefined]);
    expect(s.bucketOf(Number.NaN)).toBe(-1);
    expect(s.empty.fill).toBe('var(--jc-track)');
  });

  it('clamps out-of-domain values and honours a custom bucket count and colour', () => {
    const s = resolveHeatmapColors(f(1, 2), { buckets: 3, color: '#ff0000', domain: [0, 3] });
    expect(s.buckets).toHaveLength(3);
    expect(s.bucketOf(-10)).toBe(0);
    expect(s.bucketOf(10)).toBe(2);
    expect(s.buckets[0]!.fill).toBe('#ff0000');
  });

  it('handles empty, all-zero, all-equal and negative-only data', () => {
    expect(resolveHeatmapColors(f()).domain).toEqual([0, 1]);
    const zeros = resolveHeatmapColors(f(0, 0, 0));
    expect(zeros.bucketOf(0)).toBe(0);
    const equal = resolveHeatmapColors(f(7, 7, 7));
    expect(equal.bucketOf(7)).toBe(4); // all at the strongest step
    const negative = resolveHeatmapColors(f(-3, -3));
    expect(negative.bucketOf(-3)).toBe(0);
  });

  it('treats zero as empty for activity scales and closes steps on the right', () => {
    const s = resolveHeatmapColors(f(0, 1, 2, 3, 4), { buckets: 4, zeroAsEmpty: true });
    expect(s.domain).toEqual([0, 4]);
    expect([0, -1, 1, 2, 3, 4, 0.1].map(s.bucketOf)).toEqual([-1, -1, 0, 1, 2, 3, 0]);
  });

  it('uses explicit thresholds', () => {
    const s = resolveHeatmapColors(f(0, 100), { thresholds: [10, 1, 5] });
    expect(s.buckets).toHaveLength(4);
    expect([0, 1, 4.9, 5, 9, 10, 1000].map(s.bucketOf)).toEqual([0, 1, 1, 2, 2, 3, 3]);
    expect(s.buckets.map((b) => [b.from, b.to])).toEqual([
      [0, 1],
      [1, 5],
      [5, 10],
      [10, 100],
    ]);
  });

  it('diverges around the midpoint with a neutral middle step', () => {
    const s = resolveHeatmapColors(f(-10, -2, 0, 3, 5), { scale: 'diverging' });
    expect(s.domain).toEqual([-10, 10]);
    expect([-10, -5, -2, 0, 1.9, 3, 10].map(s.bucketOf)).toEqual([0, 1, 2, 2, 2, 3, 4]);
    const fills = s.buckets.map((b) => b.fill);
    expect(fills).toEqual([
      'var(--jc-negative)',
      'var(--jc-negative)',
      'var(--jc-track)',
      'var(--jc-positive)',
      'var(--jc-positive)',
    ]);
    expect(s.buckets.map((b) => b.fillOpacity)).toEqual([
      undefined,
      0.5,
      undefined,
      0.5,
      undefined,
    ]);
    // Even counts have no neutral step.
    const even = resolveHeatmapColors(f(-1, 1), { scale: 'diverging', buckets: 4 });
    expect(even.buckets.map((b) => b.fill)).not.toContain('var(--jc-track)');
    expect(even.bucketOf(-0.1)).toBe(1);
    expect(even.bucketOf(0.1)).toBe(2);
    // Custom colours and midpoint.
    const custom = resolveHeatmapColors(f(40, 60), {
      scale: 'diverging',
      midpoint: 50,
      negativeColor: 'blue',
      positiveColor: 'red',
    });
    expect(custom.domain).toEqual([40, 60]);
    expect(custom.buckets[0]!.fill).toBe('blue');
    expect(custom.buckets[4]!.fill).toBe('red');
  });

  it('samples a concrete colour ramp and picks readable ink', () => {
    const s = resolveHeatmapColors(f(0, 1), { colors: ['#ffffff', '#000000'], buckets: 3 });
    expect(s.buckets.map((b) => b.fill)).toEqual(['#ffffff', s.buckets[1]!.fill, '#000000']);
    expect(s.buckets[1]!.fill).toMatch(/^#[0-9a-f]{6}$/);
    expect(s.buckets[0]!.fillOpacity).toBeUndefined();
    expect(s.buckets[0]!.ink.fill).toBe('#0b0d12');
    expect(s.buckets[2]!.ink.fill).toBe('#ffffff');
    // A ramp with exactly one colour per bucket is used as is.
    const exact = resolveHeatmapColors(f(0, 1), { colors: ['a', 'b'], buckets: 2 });
    expect(exact.buckets.map((b) => b.fill)).toEqual(['a', 'b']);
    // Translucent steps use the theme text colour, opaque steps the on-fill ink.
    const seq = resolveHeatmapColors(f(0, 1));
    expect(seq.buckets[0]!.ink).toEqual({ tone: 'primary' });
    expect(seq.buckets[4]!.ink).toEqual({ fill: 'var(--jc-on-fill)' });
  });
});

describe('heatmap model', () => {
  it('lays out one inset, rounded cell per category pair with stable keys', () => {
    const m = buildHeatmapModel(grid(3, 2, (x, y) => x + y * 3));
    expect(m.marks).toHaveLength(6);
    expect(m.columns).toBe(3);
    expect(m.rows).toBe(2);
    const a = m.marks.find((c) => c.key === 'x0|y0')!;
    const b = m.marks.find((c) => c.key === 'x1|y0')!;
    const c = m.marks.find((c) => c.key === 'x0|y1')!;
    expect(b.x - (a.x + a.width)).toBeCloseTo(2); // surface gap
    expect(c.y - (a.y + a.height)).toBeCloseTo(2);
    expect(a.radius).toBe(3);
    expect(a.enter).toEqual({ opacity: 0 });
    // Cells fill the plot.
    const plot = m.frame.plot;
    expect(a.x - plot.x).toBeCloseTo(1);
    const last = m.marks.find((c) => c.key === 'x2|y1')!;
    expect(plot.x + plot.width - (last.x + last.width)).toBeCloseTo(1);
    expect(m.frame.xTicks.map((t) => t.label)).toEqual(['x0', 'x1', 'x2']);
    expect(m.frame.yTicks.map((t) => t.label)).toEqual(['y0', 'y1']);
  });

  it('hit tests by band inversion', () => {
    const m = buildHeatmapModel(grid(4, 3, () => 1));
    for (let cell = 0; cell < 12; cell++) {
      const r = m.cellRect(cell)!;
      expect(m.hitTest(r.x + r.width / 2, r.y + r.height / 2)).toBe(cell);
      // The gap between cells resolves to a neighbour, never to nothing.
      expect(m.hitTest(r.x - 0.5, r.y - 0.5)).toBeGreaterThanOrEqual(0);
    }
    expect(m.hitTest(0, 0)).toBe(-1);
    expect(m.hitTest(10_000, 10)).toBe(-1);
    expect(m.cellRect(12)).toBeNull();
    expect(m.cellRect(-1)).toBeNull();
  });

  it('copes with empty data and a single cell', () => {
    const empty = buildHeatmapModel({
      width: 300,
      height: 200,
      xLabels: [],
      yLabels: [],
      values: f(),
    });
    expect(empty.marks).toEqual([]);
    expect(empty.hitTest(100, 100)).toBe(-1);
    expect(empty.activeMarks(0)).toEqual([]);
    const one = buildHeatmapModel({
      width: 300,
      height: 200,
      xLabels: ['a'],
      yLabels: ['b'],
      values: f(5),
    });
    expect(one.marks).toHaveLength(1);
    expect(one.marks[0]!.fillOpacity).toBeUndefined(); // strongest step
    expect(one.defined).toBe(1);
    const r = one.cellRect(0)!;
    expect(one.hitTest(r.x + 1, r.y + 1)).toBe(0);
    expect(one.activeMarks(0)).toHaveLength(3);
  });

  it('draws missing cells with the track colour', () => {
    const m = buildHeatmapModel(grid(2, 2, (x, y) => (x === y ? Number.NaN : x + y)));
    const missing = m.marks.filter((c) => c.fill === 'var(--jc-track)');
    expect(missing).toHaveLength(2);
    expect(m.defined).toBe(2);
    expect(Array.from(m.cellBuckets)).toEqual([-1, 4, 4, -1]);
    expect(missing.every((c) => c.series === 5)).toBe(true); // legend slot after the steps
  });

  it('renders a 50×50 grid with a handful of paths', () => {
    const m = buildHeatmapModel(grid(50, 50, (x, y) => Math.sin(x / 5) * Math.cos(y / 7) * 100));
    expect(m.marks).toHaveLength(2500);
    expect(pathCount(m.marks)).toBeLessThanOrEqual(6);
    // Many categories: labels thinned so they never overlap.
    expect(m.frame.xTicks.length).toBeLessThan(50);
    expect(m.frame.xTicks.length).toBeGreaterThan(1);
    const diverging = buildHeatmapModel({
      ...grid(50, 50, (x, y) => x - y + (x % 3 === 0 ? Number.NaN : 0)),
      colors: { scale: 'diverging', buckets: 7 },
    });
    expect(pathCount(diverging.marks)).toBeLessThanOrEqual(8);
  });

  it('keeps every bucket in one batch after sorting', () => {
    const marks: Mark[] = [3, 1, 3, 0, 1].map((s, i) => ({
      type: 'rect',
      key: String(i),
      x: i,
      y: 0,
      width: 1,
      height: 1,
      series: s,
    }));
    expect(sortHeatmapCells(marks, 4).map((m) => m.key)).toEqual(['3', '1', '4', '0', '2']);
  });

  it('labels cells only where the text fits, with readable ink', () => {
    const big = buildHeatmapModel({ ...grid(3, 3, (x, y) => x * 10 + y), labels: true });
    expect(big.labels).toHaveLength(9);
    expect(big.labels.find((l) => l.text === '0')!.tone).toBe('primary');
    expect(big.labels.find((l) => l.text === '22')!.fill).toBe('var(--jc-on-fill)');
    const small = buildHeatmapModel({
      ...grid(60, 40, (x) => x * 1000.5),
      labels: true,
      labelFormat: (v) => v.toFixed(2),
    });
    expect(small.labels).toHaveLength(0);
    const none = buildHeatmapModel(grid(3, 3, () => 1));
    expect(none.labels).toHaveLength(0);
  });

  it('truncates long category labels and shrinks gaps for tiny cells', () => {
    const long = 'A very long category name that cannot possibly fit on the axis';
    const m = buildHeatmapModel({
      width: 400,
      height: 300,
      xLabels: ['a', 'b'],
      yLabels: [long, 'short'],
      values: f(1, 2, 3, 4),
    });
    const label = m.frame.yTicks[0]!.label;
    expect(label.endsWith('…')).toBe(true);
    expect(m.frame.plot.x).toBeLessThan(200);
    const tiny = buildHeatmapModel({ ...grid(200, 10, () => 1), width: 400 });
    const [a, b] = [tiny.marks[0]!, tiny.marks[1]!];
    expect(a.width).toBeGreaterThan(0);
    expect(Math.abs(b.x - (a.x + a.width))).toBeLessThan(2);
    expect(a.radius as number).toBeLessThanOrEqual(a.width / 4);
  });

  it('emphasises the active cell with a halo, the cell and an outline', () => {
    const m = buildHeatmapModel(grid(2, 2, (x) => x));
    const [bg, cell, ring] = m.activeMarks(1) as [Mark, Mark, Mark];
    expect(bg.fill).toBe('var(--jc-bg)');
    expect(cell.fill).toBe('var(--jc-series-1)');
    expect(ring.stroke).toBe('var(--jc-text)');
    const r = m.cellRect(1)!;
    expect(cell.type === 'rect' && cell.width).toBeCloseTo(r.width + 3);
  });
});
