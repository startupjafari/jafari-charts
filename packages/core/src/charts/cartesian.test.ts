import { describe, expect, it } from 'vitest';
import type { Mark, RectMark } from '../scene/marks';
import { buildCartesianModel, type CartesianSeriesSpec, type CartesianSpec } from './cartesian';

const f = (...v: number[]) => Float64Array.from(v);
const series = (
  id: string,
  values: Float64Array,
  extra: Partial<CartesianSeriesSpec> = {},
): CartesianSeriesSpec => ({
  id,
  label: id,
  color: `var(--${id})`,
  type: 'bar',
  values,
  ...extra,
});
const base = (s: CartesianSeriesSpec[], extra: Partial<CartesianSpec> = {}): CartesianSpec => ({
  width: 600,
  height: 300,
  x: { type: 'category', values: new Float64Array(0), labels: ['A', 'B', 'C'] },
  series: s,
  ...extra,
});
const rects = (marks: Mark[]) => marks.filter((m): m is RectMark => m.type === 'rect');

describe('cartesian model: bars', () => {
  it('draws one bar per value with rounded data ends only', () => {
    const m = buildCartesianModel(base([series('a', f(10, -5, 20))]));
    const r = rects(m.marks);
    expect(r).toHaveLength(3);
    expect(r[0]!.radius).toEqual([4, 4, 0, 0]);
    expect(r[1]!.radius).toEqual([0, 0, 4, 4]); // negative bar rounds at the bottom
    // All bars grow from the zero baseline.
    const zero = m.frame.y.kind === 'linear' ? m.frame.y.map(0) : NaN;
    expect(r[0]!.y + r[0]!.height).toBeCloseTo(zero);
    expect(r[1]!.y).toBeCloseTo(zero);
    expect(r[0]!.width).toBeLessThanOrEqual(24);
  });

  it('groups series side by side with a 2px gap', () => {
    const m = buildCartesianModel(base([series('a', f(1, 2, 3)), series('b', f(3, 2, 1))]));
    const r = rects(m.marks);
    const a0 = r.find((x) => x.series === 0 && x.index === 0)!;
    const b0 = r.find((x) => x.series === 1 && x.index === 0)!;
    expect(b0.x - (a0.x + a0.width)).toBeCloseTo(2);
  });

  it('stacks with surface gaps and rounds only the outer segment', () => {
    const m = buildCartesianModel(
      base([
        series('a', f(10, 10, 10), { stack: 's' }),
        series('b', f(10, 10, 10), { stack: 's' }),
      ]),
    );
    const r = rects(m.marks);
    const a = r.find((x) => x.series === 0 && x.index === 0)!;
    const b = r.find((x) => x.series === 1 && x.index === 0)!;
    expect(a.x).toBe(b.x); // same slot
    expect(a.radius).toEqual([0, 0, 0, 0]);
    expect(b.radius).toEqual([4, 4, 0, 0]);
    expect(a.y - (b.y + b.height)).toBeCloseTo(2); // the gap
  });

  it('keeps diverging stacks apart for mixed signs', () => {
    const m = buildCartesianModel(
      base([series('a', f(10, 0, 0), { stack: 's' }), series('b', f(-5, 0, 0), { stack: 's' })]),
    );
    const [a, b] = [m.hi[0]![0], m.lo[1]![0]];
    expect(a).toBe(10);
    expect(b).toBe(-5);
  });

  it('percent stacking normalises to 0..1 with a percent axis', () => {
    const m = buildCartesianModel(
      base([series('a', f(1, 3, 0), { stack: 's' }), series('b', f(3, 1, 0), { stack: 's' })], {
        stackOffset: 'expand',
      }),
    );
    expect(m.hi[1]![0]).toBeCloseTo(1);
    expect(m.frame.yTicks.at(-1)!.label).toBe('100%');
  });

  it('collapses hidden series and handles horizontal layout', () => {
    const m = buildCartesianModel(
      base([series('a', f(1, 2, 3)), series('b', f(3, 2, 1), { visible: false })], {
        orientation: 'horizontal',
        barLabels: true,
      }),
    );
    const r = rects(m.marks);
    expect(r.every((x) => x.series === 0)).toBe(true);
    expect(r[0]!.radius).toEqual([0, 4, 4, 0]);
    expect(r[0]!.y).toBeLessThan(r[1]!.y); // first category on top
    expect(m.labels).toHaveLength(3);
  });

  it('hit tests bands and items', () => {
    const m = buildCartesianModel(base([series('a', f(5, 5, 5)), series('b', f(5, 5, 5))]));
    const b1 = m.barRect(1, 2)!;
    expect(m.hitTest(b1.x + 1, b1.y + 1, 'shared')).toEqual({ position: 2, series: -1 });
    expect(m.hitTest(b1.x + 1, b1.y + 1, 'item')).toEqual({ position: 2, series: 1 });
    expect(m.hitTest(-100, -100)).toBeNull();
    expect(m.bandRect(0)!.width).toBeGreaterThan(0);
  });

  it('draws bars on a log scale from the bottom of the axis', () => {
    const m = buildCartesianModel(base([series('a', f(10, 100, 1000))], { y: { scale: 'log' } }));
    const r = rects(m.marks);
    expect(r).toHaveLength(3);
    expect(r[0]!.y + r[0]!.height).toBeCloseTo(m.frame.plot.y + m.frame.plot.height);
    expect(r[2]!.height).toBeGreaterThan(r[0]!.height);
  });

  it('copes with empty, all-zero and all-missing data', () => {
    expect(
      buildCartesianModel(
        base([series('a', f())], { x: { type: 'category', values: f(), labels: [] } }),
      ).marks,
    ).toEqual([]);
    const zeros = buildCartesianModel(base([series('a', f(0, 0, 0))]));
    expect(rects(zeros.marks).every((r) => r.height === 0)).toBe(true);
    const missing = buildCartesianModel(base([series('a', f(NaN, NaN, NaN))]));
    expect(missing.marks).toEqual([]);
  });
});

describe('cartesian model: lines and areas', () => {
  const time = (n: number) =>
    Float64Array.from({ length: n }, (_, i) => Date.UTC(2025, 0, 1) + i * 864e5);

  it('produces a continuous line with a gap and marks isolated points', () => {
    const m = buildCartesianModel({
      width: 500,
      height: 200,
      x: { type: 'time', values: time(5), labels: [], utc: true },
      series: [series('a', f(1, 2, NaN, 4, NaN), { type: 'line' })],
    });
    const line = m.marks.find((x) => x.type === 'line');
    expect(line).toBeDefined();
    const dots = m.marks.find((x) => x.type === 'symbol');
    expect(dots && dots.type === 'symbol' ? Array.from(dots.indices ?? []) : []).toEqual([3]);
    expect(m.band).toBe(false);
  });

  it('downsamples large series to about two points per pixel', () => {
    const n = 100_000;
    const m = buildCartesianModel({
      width: 500,
      height: 200,
      x: { type: 'number', values: Float64Array.from({ length: n }, (_, i) => i), labels: [] },
      series: [
        series(
          'a',
          Float64Array.from({ length: n }, (_, i) => Math.sin(i / 1000)),
          { type: 'line' },
        ),
      ],
    });
    const line = m.marks.find((x) => x.type === 'line');
    expect(line && line.type === 'line' ? line.xs.length : 0).toBeLessThanOrEqual(1000);
    // Hit testing still resolves exact source positions.
    const hit = m.hitTest(m.frame.plot.x + m.frame.plot.width / 2, 100);
    expect(hit!.position).toBeGreaterThan(40_000);
    expect(hit!.position).toBeLessThan(60_000);
  });

  it('restricts work to the zoomed domain', () => {
    const n = 1000;
    const m = buildCartesianModel({
      width: 500,
      height: 200,
      x: {
        type: 'number',
        values: Float64Array.from({ length: n }, (_, i) => i),
        labels: [],
        domain: [100, 200],
      },
      series: [
        series(
          'a',
          Float64Array.from({ length: n }, (_, i) => i),
          { type: 'line' },
        ),
      ],
    });
    expect(m.visible).toEqual([99, 201]);
    expect(m.hitTest(m.frame.plot.x, 100)!.position).toBe(100);
  });

  it('stacks areas on a shared baseline with gradient fills', () => {
    const m = buildCartesianModel({
      width: 500,
      height: 200,
      x: { type: 'category', values: f(), labels: ['a', 'b'] },
      series: [
        series('a', f(1, 2), { type: 'area', stack: 's' }),
        series('b', f(1, 1), { type: 'area', stack: 's' }),
      ],
    });
    const areas = m.marks.filter((x) => x.type === 'area');
    expect(areas).toHaveLength(2);
    const top = areas[1]!;
    expect(top.type === 'area' && typeof top.y0s !== 'number').toBe(true);
    expect(top.type === 'area' && typeof top.fill === 'object').toBe(true);
    expect(m.hi[1]![1]).toBe(3);
  });

  it('places line points at band centres on category axes', () => {
    const m = buildCartesianModel(base([series('a', f(1, 2, 3), { type: 'line' })]));
    const p = m.point(0, 1)!;
    expect(p.x).toBeCloseTo(m.position(1));
    expect(m.hitTest(p.x, p.y, 'item')).toEqual({ position: 1, series: 0 });
  });
});

describe('cartesian model: category window (x.range)', () => {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const values = f(1, 2, 3, 4, 5, 60);
  const windowed = (range?: readonly [number, number], extra: Partial<CartesianSpec> = {}) =>
    buildCartesianModel(
      base([series('a', values)], {
        x: {
          type: 'category',
          values: new Float64Array(0),
          labels,
          ...(range ? { range } : {}),
        },
        ...extra,
      }),
    );

  it('lays out only the window, filling the plot', () => {
    const full = windowed();
    const m = windowed([1, 3]);
    expect(m.visible).toEqual([1, 3]);
    expect(m.length).toBe(6);
    const r = rects(m.marks);
    expect(r.map((x) => x.index)).toEqual([1, 2, 3]);
    expect(m.frame.xTicks.map((t) => t.label)).toEqual(['Feb', 'Mar', 'Apr']);
    // Three bands share the plot: about twice as wide as six.
    const step = (mm: typeof m) => (mm.frame.x as { step: number }).step / mm.frame.plot.width;
    expect(step(m) / step(full)).toBeCloseTo(2, 1);
    // The value axis fits the visible values (60 is outside the window).
    expect((m.frame.y as { domain: readonly number[] }).domain[1]).toBeLessThan(10);
  });

  it('positions, band rectangles and hit testing use full-data positions', () => {
    const m = windowed([2, 4]);
    const p = m.position(3);
    expect(p).toBeGreaterThan(m.frame.plot.x);
    expect(m.indexAt(p)).toBe(3);
    expect(m.hitTest(p, m.frame.plot.y + 10)).toEqual({ position: 3, series: -1 });
    expect(m.bandRect(0)).toBeNull();
    expect(m.bandRect(2)!.x).toBeCloseTo(m.frame.plot.x, 0);
    // Pixels left of the window resolve to its first category.
    expect(m.indexAt(m.frame.plot.x - 50)).toBe(2);
    expect((m.frame.x as { offset?: number }).offset).toBe(2);
  });

  it('clamps and orders the range, and ignores it on continuous axes', () => {
    expect(windowed([4, 9]).visible).toEqual([4, 5]);
    expect(windowed([3, 1]).visible).toEqual([1, 3]);
    const line = buildCartesianModel({
      width: 600,
      height: 300,
      x: { type: 'number', values: f(0, 1, 2, 3), labels: [], range: [1, 2] },
      series: [series('a', f(1, 2, 3, 4), { type: 'line' })],
    });
    expect(line.visible).toEqual([0, 3]);
  });

  it('windows horizontal bars along y', () => {
    const m = windowed([0, 1], { orientation: 'horizontal' });
    expect(m.frame.yTicks.map((t) => t.label)).toEqual(['Jan', 'Feb']);
    const r = rects(m.marks);
    expect(r).toHaveLength(2);
    expect(m.indexAt(m.position(1))).toBe(1);
  });
});
