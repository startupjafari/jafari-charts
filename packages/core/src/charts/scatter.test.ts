import { describe, expect, it } from 'vitest';
import type { SymbolMark } from '../scene/marks';
import { buildScatterModel, type ScatterGroupSpec, type ScatterSpec } from './scatter';

const f = (...v: number[]) => Float64Array.from(v);
const group = (
  id: string,
  xs: Float64Array,
  ys: Float64Array,
  extra: Partial<ScatterGroupSpec> = {},
): ScatterGroupSpec => ({ id, label: id, color: `var(--${id})`, xs, ys, ...extra });
const spec = (groups: ScatterGroupSpec[], extra: Partial<ScatterSpec> = {}): ScatterSpec => ({
  width: 600,
  height: 400,
  groups,
  ...extra,
});
const symbols = (marks: readonly { type: string }[]) =>
  marks.filter((m): m is SymbolMark => m.type === 'symbol');

/** Deterministic pseudo-random numbers. */
function rng(seed = 1) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

describe('scatter model', () => {
  it('draws one batched symbol mark per group with a surface ring', () => {
    const m = buildScatterModel(
      spec([group('a', f(1, 2, 3), f(4, 5, 6)), group('b', f(2, 3), f(1, 9))]),
    );
    const s = symbols(m.marks);
    expect(s).toHaveLength(2);
    expect(s[0]!.xs).toHaveLength(3);
    expect(s[0]).toMatchObject({ size: 8, stroke: 'var(--jc-bg)', strokeWidth: 4, series: 0 });
    expect(s[1]!.series).toBe(1);
    expect(m.count).toBe(5);
    // Both axes continuous, points inside the plot.
    expect(m.frame.x.kind).toBe('linear');
    expect(m.frame.y.kind).toBe('linear');
    const { plot } = m.frame;
    for (let i = 0; i < m.count; i++) {
      expect(m.px[i]).toBeGreaterThanOrEqual(plot.x - 1e-9);
      expect(m.px[i]).toBeLessThanOrEqual(plot.x + plot.width + 1e-9);
    }
  });

  it('skips NaN / missing coordinates but keeps original datum indices', () => {
    const m = buildScatterModel(
      spec([group('a', f(1, NaN, 3, 4), f(1, 2, NaN, 4), { indices: Uint32Array.of(0, 1, 2, 3) })]),
    );
    expect(m.count).toBe(2);
    expect(Array.from(symbols(m.marks)[0]!.indices ?? [])).toEqual([0, 3]);
    expect(m.find(0, 3)).toBe(1);
    expect(m.find(0, 1)).toBe(-1);
    expect(m.point(1)).toMatchObject({ group: 0, index: 3, xValue: 4, yValue: 4 });
  });

  it('copes with empty data, a single point and identical points', () => {
    const empty = buildScatterModel(spec([group('a', f(), f())]));
    expect(empty.marks).toEqual([]);
    expect(empty.count).toBe(0);
    expect(empty.hitTest(100, 100)).toBe(-1);
    expect(empty.step(-1, 'next')).toBe(-1);
    expect(empty.frame.plot.width).toBeGreaterThan(0);

    const single = buildScatterModel(spec([group('a', f(5), f(42))]));
    const [xd0, xd1] = single.frame.x.domain as [number, number];
    const [yd0, yd1] = single.frame.y.domain as [number, number];
    expect(xd0).toBeLessThan(5);
    expect(xd1).toBeGreaterThan(5);
    expect(yd0).toBeLessThan(42);
    expect(yd1).toBeGreaterThan(42);
    const p = single.point(0)!;
    expect(single.hitTest(p.x + 10, p.y - 10)).toBe(0);

    const n = 5000;
    const same = buildScatterModel(
      spec([group('a', new Float64Array(n).fill(3), new Float64Array(n).fill(3))]),
    );
    expect(same.count).toBe(n);
    const q = same.point(0)!;
    expect(same.hitTest(q.x + 3, q.y)).toBeGreaterThanOrEqual(0);
    expect(same.step(0, 'last')).toBeGreaterThanOrEqual(0);
  });

  it('spans negative values and reports zero lines', () => {
    const m = buildScatterModel(spec([group('a', f(-40, 10, 60), f(-5, 3, 12))]));
    const [x0, x1] = m.frame.x.domain as [number, number];
    expect(x0).toBeLessThanOrEqual(-40);
    expect(x1).toBeGreaterThanOrEqual(60);
    expect(m.zero.x).not.toBeNull();
    expect(m.zero.y).not.toBeNull();
    expect(m.zero.y!).toBeCloseTo(m.frame.y.kind === 'linear' ? m.frame.y.map(0) : NaN);
    // Positive-only data far from zero zooms to its range (includeZero: 'auto').
    const far = buildScatterModel(spec([group('a', f(150, 180), f(1000, 1100))]));
    expect((far.frame.x.domain as [number, number])[0]).toBeGreaterThan(0);
    expect(far.zero).toEqual({ x: null, y: null });
  });

  it('supports log axes and drops non-positive values there', () => {
    const m = buildScatterModel(
      spec([group('a', f(1, 10, 100, 0, -5), f(1, 2, 3, 4, 5))], { x: { scale: 'log' } }),
    );
    expect(m.frame.x.kind).toBe('log');
    expect(m.count).toBe(3);
  });

  it('excludes hidden groups from the domain, marks and hit testing', () => {
    const m = buildScatterModel(
      spec([group('a', f(1, 2), f(1, 2)), group('b', f(1000), f(1000), { visible: false })]),
    );
    expect((m.frame.x.domain as [number, number])[1]).toBeLessThan(10);
    expect(symbols(m.marks)).toHaveLength(1);
    expect(m.groups[1]).toEqual({ start: 2, end: 2 });
    expect(m.find(1, 0)).toBe(-1);
  });

  it('batches per-point colours into one mark per colour', () => {
    const m = buildScatterModel(
      spec([
        group('a', f(1, 2, 3, 4), f(1, 2, 3, 4), { colors: ['red', 'blue', 'red', undefined] }),
      ]),
    );
    const s = symbols(m.marks);
    expect(s.map((x) => x.fill)).toEqual(['red', 'blue', 'var(--a)']);
    expect(Array.from(s[0]!.indices ?? [])).toEqual([0, 2]);
    expect(m.point(1)!.color).toBe('blue');
  });

  it('keeps 10 000 points in one mark per group', () => {
    const r = rng(3);
    const groups = [0, 1, 2].map((g) =>
      group(
        `g${g}`,
        Float64Array.from({ length: 3334 }, () => r() * 100 + g * 20),
        Float64Array.from({ length: 3334 }, () => r() * 50),
      ),
    );
    const m = buildScatterModel(spec(groups));
    expect(m.count).toBe(10_002);
    expect(symbols(m.marks)).toHaveLength(3);
    expect(symbols(m.marks)[0]!.size).toBe(4); // dense data uses smaller markers
  });
});

describe('scatter hit testing', () => {
  it('matches a brute-force nearest search within the hit radius', () => {
    const r = rng(11);
    const n = 3000;
    const m = buildScatterModel(
      spec([
        group(
          'a',
          Float64Array.from({ length: n }, () => r() * 1000 - 300),
          Float64Array.from({ length: n }, () => r() * r() * 80),
        ),
        group(
          'b',
          Float64Array.from({ length: 500 }, () => r() * 1000),
          Float64Array.from({ length: 500 }, () => r() * 80),
        ),
      ]),
    );
    for (let q = 0; q < 400; q++) {
      const x = r() * 640 - 20;
      const y = r() * 440 - 20;
      let best = -1;
      let bestD = 24;
      for (let i = 0; i < m.count; i++) {
        const d = Math.hypot((m.px[i] as number) - x, (m.py[i] as number) - y);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      const hit = m.hitTest(x, y);
      if (best < 0) expect(hit).toBe(-1);
      else {
        // Ties may resolve to a different point at the same distance.
        const p = m.point(hit)!;
        expect(Math.hypot(p.x - x, p.y - y)).toBeCloseTo(bestD, 9);
      }
    }
  });

  it('uses a 24px target that is larger than the 8px marker', () => {
    const m = buildScatterModel(spec([group('a', f(0, 100), f(0, 100))]));
    const p = m.point(1)!;
    expect(m.hitTest(p.x + 20, p.y)).toBe(1);
    expect(m.hitTest(p.x + 30, p.y)).toBe(-1);
  });

  it('hits large bubbles anywhere inside and prefers the smaller of overlapping bubbles', () => {
    const m = buildScatterModel(
      spec([group('a', f(10, 50, 52), f(10, 50, 50), { sizes: f(1, 100, 4) })], {
        maxRadius: 40,
        minRadius: 2,
      }),
    );
    const big = m.point(1)!;
    expect(big.radius).toBeCloseTo(40);
    // 35px from the centre, but inside the bubble.
    expect(m.hitTest(big.x - 35, big.y)).toBe(1);
    // The small bubble sits inside the big one: pointing at it selects it.
    const small = m.point(2)!;
    expect(m.hitTest(small.x, small.y)).toBe(2);
  });
});

describe('bubble sizes', () => {
  it('makes bubble area proportional to the value', () => {
    const sizes = f(100, 25, 400, 50, 0, NaN, -3);
    const m = buildScatterModel(
      spec([group('a', f(1, 2, 3, 4, 5, 6, 7), f(1, 2, 3, 4, 5, 6, 7), { sizes })], {
        maxRadius: 30,
        minRadius: 2,
      }),
    );
    const r = (i: number) => m.point(i)!.radius;
    expect(r(2)).toBeCloseTo(30); // the largest value gets the maximum radius
    expect((r(0) / r(2)) ** 2).toBeCloseTo(100 / 400);
    expect((r(1) / r(0)) ** 2).toBeCloseTo(25 / 100);
    expect((r(3) / r(1)) ** 2).toBeCloseTo(2);
    // Zero, missing and negative sizes are drawn at the minimum radius.
    expect(r(4)).toBe(2);
    expect(r(5)).toBe(2);
    expect(r(6)).toBe(2);
    const mark = symbols(m.marks)[0]!;
    expect(mark.size).toBeInstanceOf(Float64Array);
    expect((mark.size as Float64Array)[2]).toBeCloseTo(60);
    expect(m.bubble).toEqual({ minRadius: 2, maxRadius: 30, sizeMax: 400 });
  });

  it('does not pad the domain for small markers (no extra tick step)', () => {
    const m = buildScatterModel(spec([group('a', f(0, 10, 20), f(40, 60, 100))]));
    expect(m.frame.y.domain).toEqual([40, 100]);
    expect(m.frame.x.domain).toEqual([0, 20]);
  });

  it('pads the domain so edge bubbles stay inside the plot', () => {
    const m = buildScatterModel(
      spec([group('a', f(10, 20, 30), f(10, 20, 30), { sizes: f(5, 5, 5) })], { maxRadius: 20 }),
    );
    const { plot } = m.frame;
    for (let i = 0; i < m.count; i++) {
      const p = m.point(i)!;
      expect(p.x - p.radius).toBeGreaterThanOrEqual(plot.x - 0.5);
      expect(p.x + p.radius).toBeLessThanOrEqual(plot.x + plot.width + 0.5);
      expect(p.y - p.radius).toBeGreaterThanOrEqual(plot.y - 0.5);
      expect(p.y + p.radius).toBeLessThanOrEqual(plot.y + plot.height + 0.5);
    }
  });
});

describe('scatter keyboard navigation', () => {
  it('walks points in x order and switches groups to the nearest point', () => {
    const m = buildScatterModel(
      spec([group('a', f(30, 10, 20), f(1, 2, 3)), group('b', f(5, 19, 40), f(9, 9, 9))]),
    );
    const first = m.step(-1, 'next');
    expect(m.point(first)!.xValue).toBe(10);
    const second = m.step(first, 'next');
    expect(m.point(second)!.xValue).toBe(20);
    expect(m.point(m.step(second, 'prev'))!.xValue).toBe(10);
    expect(m.point(m.step(second, 'last'))!.xValue).toBe(30);
    expect(m.step(m.step(second, 'last'), 'next')).toBe(m.step(second, 'last')); // clamps
    const other = m.step(second, 'down');
    expect(m.point(other)).toMatchObject({ group: 1, xValue: 19 });
    expect(m.point(m.step(other, 'down'))!.group).toBe(0); // wraps around
  });
});

describe('scatter model: zoom domains', () => {
  const xs = f(0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100);
  const ys = f(0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100);

  it('keeps the full domains as bounds and draws only points inside the zoom domain', () => {
    const full = buildScatterModel(spec([group('a', xs, ys)]));
    const m = buildScatterModel(
      spec([group('a', xs, ys)], { x: { domain: [15, 55] }, y: { domain: [25, 75] } }),
    );
    expect(m.bounds).toEqual(full.bounds);
    expect(m.zoomed).toBe(true);
    expect(full.zoomed).toBe(false);
    expect((m.frame.x as { domain: readonly number[] }).domain).toEqual([15, 55]);
    // Points 30, 40, 50 lie in both windows.
    expect(m.count).toBe(3);
    expect(Array.from(symbols(m.marks)[0]!.indices ?? [])).toEqual([3, 4, 5]);
    // Marker size follows the whole data set, not the visible subset.
    expect(symbols(m.marks)[0]!.size).toBe(symbols(full.marks)[0]!.size);
  });

  it('hit tests and navigates visible points only', () => {
    const m = buildScatterModel(spec([group('a', xs, ys)], { x: { domain: [15, 55] } }));
    // x = 10 exists in the data but is not drawn when zoomed: not found, not hit.
    expect(m.find(0, 1)).toBe(-1);
    expect(m.px).toHaveLength(m.count);
    const xScale = m.frame.x as { map(v: number): number };
    const yScale = m.frame.y as { map(v: number): number };
    expect(m.hitTest(xScale.map(10), yScale.map(10))).toBe(-1);
    expect(m.point(m.hitTest(xScale.map(20), yScale.map(20)))!.index).toBe(2);
    expect(m.point(m.step(-1, 'first'))!.index).toBe(2);
    expect(m.point(m.step(-1, 'last'))!.index).toBe(5);
  });

  it('clamps a domain to the bounds and keeps its span', () => {
    const m = buildScatterModel(spec([group('a', xs, ys)], { x: { domain: [-500, -400] } }));
    const [b0] = m.bounds.x;
    expect((m.frame.x as { domain: readonly number[] }).domain).toEqual([b0, b0 + 100]);
    // Degenerate domains are ignored.
    expect(buildScatterModel(spec([group('a', xs, ys)], { x: { domain: [5, 5] } })).zoomed).toBe(
      false,
    );
  });

  it('zooms log axes in decades', () => {
    const lx = f(1, 10, 100, 1000);
    const m = buildScatterModel(
      spec([group('a', lx, f(1, 2, 3, 4))], { x: { scale: 'log', domain: [5, 200] } }),
    );
    expect(m.count).toBe(2);
    const d = (m.frame.x as { domain: readonly number[] }).domain;
    expect(d[0]).toBeCloseTo(5);
    expect(d[1]).toBeCloseTo(200);
  });

  it('selects drawn points inside a pixel rectangle', () => {
    const m = buildScatterModel(spec([group('a', xs, ys)]));
    const a = m.point(m.find(0, 2))!;
    const b = m.point(m.find(0, 4))!;
    const inner = m.inRect(b.x - 1, b.y + 1, a.x + 1, a.y - 1).map((k) => m.point(k)!.index);
    expect(inner).toEqual([3]);
    const all = m.inRect(a.x - 1, b.y - 1, b.x + 1, a.y + 1).map((k) => m.point(k)!.index);
    expect(all).toEqual([2, 3, 4]);
  });
});
