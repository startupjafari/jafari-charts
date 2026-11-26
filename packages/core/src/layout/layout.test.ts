import { describe, expect, it } from 'vitest';
import { estimateTextWidth } from '../formatting/text';
import { createBandScale } from '../scales/band';
import { createLinearScale } from '../scales/linear';
import { bandTicks, continuousTicks } from './axis';
import { baselinePosition, computeCartesianFrame, resolveValueDomain } from './cartesian';
import { computePolarFrame, hitTestSlices, pieLayout, pointAngle, TAU } from './polar';

describe('resolveValueDomain', () => {
  it('includes zero and nices by default', () => {
    expect(resolveValueDomain([12, 87])).toEqual([0, 100]);
  });

  it('handles all-zero, all-equal, empty and negative data', () => {
    expect(resolveValueDomain([0, 0])).toEqual([0, 1]);
    expect(resolveValueDomain([5, 5], { includeZero: false })).toEqual([4.4, 5.6]);
    expect(resolveValueDomain([5, 5], { includeZero: false, nice: false })).toEqual([4.5, 5.5]);
    expect(resolveValueDomain([5, 5])).toEqual([0, 5]);
    expect(resolveValueDomain([Number.NaN, Number.NaN])).toEqual([0, 1]);
    expect(resolveValueDomain([-30, -10])).toEqual([-30, 0]);
    expect(resolveValueDomain([-7, 13])).toEqual([-10, 15]);
  });

  it('applies the auto zero heuristic', () => {
    expect(resolveValueDomain([10, 100], { includeZero: 'auto' })[0]).toBe(0);
    expect(resolveValueDomain([150, 160], { includeZero: 'auto' })[0]).toBeGreaterThan(100);
  });

  it('honours fixed bounds and log domains', () => {
    expect(resolveValueDomain([3, 40], { min: 0, max: 50 })).toEqual([0, 50]);
    const log = resolveValueDomain([0, 500], { log: true });
    expect(log[0]).toBeGreaterThan(0);
  });

  it('copes with very large and fractional numbers', () => {
    expect(resolveValueDomain([0, 9.3e11])).toEqual([0, 1e12]);
    expect(resolveValueDomain([0.0012, 0.0087])).toEqual([0, 0.01]);
  });
});

describe('axis ticks', () => {
  it('never lets x labels overlap', () => {
    const scale = createLinearScale({ domain: [0, 1_000_000_000], range: [40, 300] });
    const ticks = continuousTicks({ scale, direction: 'x', fontSize: 11 });
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < ticks.length; i++) {
      const gap = ticks[i]!.position - ticks[i - 1]!.position;
      const need =
        (estimateTextWidth(ticks[i]!.label, 11) + estimateTextWidth(ticks[i - 1]!.label, 11)) / 2;
      expect(gap).toBeGreaterThanOrEqual(need);
    }
  });

  it('uses compact labels for large values and locale-aware decimals', () => {
    const big = continuousTicks({
      scale: createLinearScale({ domain: [0, 50_000], range: [200, 0] }),
      direction: 'y',
    });
    expect(big.map((t) => t.label)).toContain('50K');
    const ru = continuousTicks({
      scale: createLinearScale({ domain: [0, 1], range: [200, 0] }),
      direction: 'y',
      locale: 'ru',
    });
    expect(ru.map((t) => t.label)).toContain('0,2');
  });

  it('thins and truncates long category labels', () => {
    const labels = Array.from(
      { length: 40 },
      (_, i) => `Al-Farabi Kazakh National University ${i}`,
    );
    const scale = createBandScale({ domain: labels, range: [0, 400] });
    const ticks = bandTicks({ scale, direction: 'x', fontSize: 11 });
    expect(ticks.length).toBeLessThan(40);
    for (const t of ticks) expect(estimateTextWidth(t.label, 11)).toBeLessThanOrEqual(141);
  });

  it('drops a neighbour that would collide with an inward-shifted edge label', () => {
    const labels = ['a', 'b', 'c', 'scatter · 365', 'scatter · 100k'];
    const scale = createBandScale({
      domain: labels,
      range: [10, 300],
      paddingInner: 0.3,
      paddingOuter: 0,
    });
    const ticks = bandTicks({ scale, direction: 'x', fontSize: 11, bounds: [0, 300] });
    for (let i = 1; i < ticks.length; i++) {
      const w = (t: (typeof ticks)[number]) => estimateTextWidth(t.label, 11);
      const right = (t: (typeof ticks)[number]) =>
        t.anchor === 'start'
          ? t.position + w(t)
          : t.anchor === 'end'
            ? t.position
            : t.position + w(t) / 2;
      const left = (t: (typeof ticks)[number]) =>
        t.anchor === 'start'
          ? t.position
          : t.anchor === 'end'
            ? t.position - w(t)
            : t.position - w(t) / 2;
      expect(left(ticks[i]!)).toBeGreaterThan(right(ticks[i - 1]!));
    }
  });

  it('anchors edge labels inside the bounds', () => {
    const scale = createLinearScale({ domain: [0, 100], range: [0, 300] });
    const ticks = continuousTicks({ scale, direction: 'x', bounds: [0, 300] });
    expect(ticks[0]!.anchor).toBe('start');
    expect(ticks.at(-1)!.anchor).toBe('end');
  });
});

describe('computeCartesianFrame', () => {
  it('reserves room for y labels and keeps the plot inside the box', () => {
    const frame = computeCartesianFrame({
      width: 600,
      height: 300,
      x: { kind: 'band', labels: ['Mon', 'Tue', 'Wed'] },
      y: { kind: 'linear', domain: [0, 120_000] },
    });
    expect(frame.plot.x).toBeGreaterThan(20);
    expect(frame.plot.x + frame.plot.width).toBeLessThanOrEqual(600);
    expect(frame.plot.y + frame.plot.height).toBeLessThan(300);
    expect(frame.xTicks.map((t) => t.label)).toEqual(['Mon', 'Tue', 'Wed']);
    expect(frame.y.kind).toBe('linear');
  });

  it('puts categories on the y axis for horizontal layouts', () => {
    const frame = computeCartesianFrame({
      width: 400,
      height: 200,
      x: { kind: 'linear', domain: [0, 10] },
      y: { kind: 'band', labels: ['first', 'second'] },
    });
    const y = frame.y as ReturnType<typeof createBandScale>;
    expect(y.center(0)).toBeLessThan(y.center(1));
  });

  it('collapses hidden axes and survives tiny sizes', () => {
    const frame = computeCartesianFrame({
      width: 80,
      height: 30,
      x: { kind: 'linear', domain: [0, 1], hidden: true },
      y: { kind: 'linear', domain: [0, 1], hidden: true },
      padding: { top: 2, right: 2, bottom: 2, left: 2 },
    });
    expect(frame.plot).toEqual({ x: 2, y: 2, width: 76, height: 26 });
    expect(frame.yTicks.length).toBeGreaterThan(0); // still available for gridlines
    const zero = computeCartesianFrame({
      width: 0,
      height: 0,
      x: { kind: 'linear', domain: [0, 1] },
      y: { kind: 'linear', domain: [0, 1] },
    });
    expect(zero.plot.width).toBeGreaterThanOrEqual(0);
    expect(zero.plot.height).toBeGreaterThanOrEqual(0);
  });

  it('places the baseline at zero, clamped to the plot', () => {
    expect(baselinePosition(createLinearScale({ domain: [-10, 10], range: [100, 0] }))).toBe(50);
    expect(baselinePosition(createLinearScale({ domain: [5, 10], range: [100, 0] }))).toBe(100);
  });
});

describe('polar layout', () => {
  it('allocates angles proportionally and skips invalid values', () => {
    const slices = pieLayout([1, 0, 3, Number.NaN, -2]);
    expect(slices.map((s) => s.index)).toEqual([0, 2]);
    expect(slices[0]!.share).toBe(0.25);
    expect(slices[1]!.endAngle).toBeCloseTo(TAU);
    expect(pieLayout([0, 0])).toEqual([]);
  });

  it('sorts slices when requested', () => {
    expect(pieLayout([1, 5, 3], { sort: true }).map((s) => s.index)).toEqual([1, 2, 0]);
  });

  it('measures angles from 12 o’clock clockwise', () => {
    expect(pointAngle(0, -10, 0, 0)).toBeCloseTo(0);
    expect(pointAngle(10, 0, 0, 0)).toBeCloseTo(Math.PI / 2);
    expect(pointAngle(-10, 0, 0, 0)).toBeCloseTo(Math.PI * 1.5);
  });

  it('hit tests slices within the ring only', () => {
    const slices = pieLayout([1, 1, 1, 1]);
    const frame = { cx: 0, cy: 0, innerRadius: 10, outerRadius: 20 };
    expect(hitTestSlices(slices, 15, -1, frame)).toBe(0); // just right of 12 o'clock
    expect(hitTestSlices(slices, 15, 1, frame)).toBe(1);
    expect(hitTestSlices(slices, -15, 1, frame)).toBe(2);
    expect(hitTestSlices(slices, 0, 0, frame)).toBe(-1); // in the hole
    expect(hitTestSlices(slices, 100, 0, frame)).toBe(-1); // outside
  });

  it('fits semicircles using their real bounding box', () => {
    const full = computePolarFrame(400, 200, { padding: 0 });
    const semi = computePolarFrame(400, 200, {
      padding: 0,
      startAngle: -Math.PI / 2,
      endAngle: Math.PI / 2,
    });
    expect(full.radius).toBe(100);
    expect(semi.radius).toBe(200);
    expect(semi.cy).toBe(200);
  });
});
