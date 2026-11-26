import { describe, expect, it } from 'vitest';
import { createBandScale, createPointScale } from './band';
import { createLinearScale } from './linear';
import { createLogScale } from './log';
import { createOrdinalScale } from './ordinal';
import { linearTicks, niceDomain, precisionForStep, tickStep } from './ticks';
import { chooseTimeInterval, createTimeScale, floorTime, timeTicks } from './time';

describe('linearTicks', () => {
  it('produces round 1/2/5 steps', () => {
    expect(linearTicks(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(linearTicks(0, 1, 5)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(linearTicks(-50, 50, 4)).toEqual([-40, -20, 0, 20, 40]);
  });

  it('avoids floating point artefacts', () => {
    const ticks = linearTicks(0.1, 0.7, 6);
    expect(ticks).toEqual([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]);
  });

  it('handles reversed, degenerate and invalid domains', () => {
    expect(linearTicks(10, 0, 5)).toEqual([10, 8, 6, 4, 2, 0]);
    expect(linearTicks(3, 3, 5)).toEqual([3]);
    expect(linearTicks(Number.NaN, 1, 5)).toEqual([]);
  });

  it('never prints negative zero', () => {
    for (const t of linearTicks(-1, 1, 4)) expect(Object.is(t, -0)).toBe(false);
  });

  it('works with very large numbers', () => {
    const ticks = linearTicks(0, 3e12, 3);
    expect(ticks).toEqual([0, 1e12, 2e12, 3e12]);
  });
});

describe('niceDomain / tickStep / precision', () => {
  it('extends to round bounds', () => {
    expect(niceDomain([0.13, 9.7], 5)).toEqual([0, 10]);
    expect(niceDomain([-13, 87], 5)).toEqual([-20, 100]);
    expect(niceDomain([5, 5], 5)).toEqual([5, 5]);
  });

  it('computes steps and decimals', () => {
    expect(tickStep(0, 1, 4)).toBeCloseTo(0.2);
    expect(precisionForStep(0.25)).toBe(2);
    expect(precisionForStep(0.1)).toBe(1);
    expect(precisionForStep(5)).toBe(0);
    expect(precisionForStep(0.30000000000000004)).toBe(1);
  });
});

describe('createLinearScale', () => {
  it('maps and inverts', () => {
    const s = createLinearScale({ domain: [0, 100], range: [0, 500] });
    expect(s.map(50)).toBe(250);
    expect(s.invert(250)).toBe(50);
    expect(s.map(-20)).toBe(-100);
  });

  it('supports inverted pixel ranges (y axes)', () => {
    const s = createLinearScale({ domain: [-10, 10], range: [200, 0] });
    expect(s.map(0)).toBe(100);
    expect(s.map(10)).toBe(0);
  });

  it('clamps when asked', () => {
    const s = createLinearScale({ domain: [0, 1], range: [0, 100], clamp: true });
    expect(s.map(2)).toBe(100);
    expect(s.invert(-50)).toBe(0);
  });

  it('maps everything to the centre for a zero-span domain', () => {
    const s = createLinearScale({ domain: [4, 4], range: [0, 100] });
    expect(s.map(4)).toBe(50);
    expect(s.map(1000)).toBe(50);
  });
});

describe('createLogScale', () => {
  const s = createLogScale({ domain: [1, 1000], range: [0, 300] });
  it('maps powers of ten evenly', () => {
    expect(s.map(10)).toBeCloseTo(100);
    expect(s.map(100)).toBeCloseTo(200);
    expect(s.invert(200)).toBeCloseTo(100);
  });

  it('returns NaN for values the scale cannot show', () => {
    expect(s.map(0)).toBeNaN();
    expect(s.map(-5)).toBeNaN();
  });

  it('generates 1-2-5 ticks for few decades', () => {
    expect(createLogScale({ domain: [1, 100], range: [0, 100] }).ticks(10)).toEqual([
      1, 2, 5, 10, 20, 50, 100,
    ]);
  });

  it('supports negative domains and nice', () => {
    const neg = createLogScale({ domain: [-1000, -1], range: [0, 300], nice: true });
    expect(neg.map(-10)).toBeCloseTo(200);
    const nice = createLogScale({ domain: [3, 870], range: [0, 1], nice: true });
    expect(nice.domain).toEqual([1, 1000]);
  });
});

describe('band and point scales', () => {
  it('lays out bands with padding', () => {
    const s = createBandScale({
      domain: ['a', 'b', 'c', 'd'],
      range: [0, 400],
      paddingInner: 0,
      paddingOuter: 0,
    });
    expect(s.step).toBe(100);
    expect(s.bandwidth).toBe(100);
    expect(s.position(2)).toBe(200);
    expect(s.center(0)).toBe(50);
  });

  it('keeps duplicate categories as separate bands', () => {
    const s = createBandScale({
      domain: ['x', 'x', 'y'],
      range: [0, 300],
      paddingInner: 0,
      paddingOuter: 0,
    });
    expect(s.position(0)).toBe(0);
    expect(s.position(1)).toBe(100);
    expect(s.map('x')).toBe(0);
  });

  it('inverts pixels including padding gaps', () => {
    const s = createBandScale({
      domain: ['a', 'b', 'c'],
      range: [0, 300],
      paddingInner: 0.2,
      paddingOuter: 0,
    });
    expect(s.invert(s.center(1))).toBe(1);
    expect(s.invert(-50)).toBe(0);
    expect(s.invert(999)).toBe(2);
    // A pixel in the gap between bands 0 and 1 goes to the nearer one.
    const gapStart = s.position(0) + s.bandwidth;
    expect(s.invert(gapStart + 1)).toBe(0);
    expect(s.invert(s.position(1) - 1)).toBe(1);
  });

  it('supports reversed ranges and empty domains', () => {
    const s = createBandScale({
      domain: ['a', 'b'],
      range: [200, 0],
      paddingInner: 0,
      paddingOuter: 0,
    });
    expect(s.position(0)).toBe(100);
    expect(s.invert(150)).toBe(0);
    const empty = createBandScale({ domain: [], range: [0, 100] });
    expect(empty.invert(10)).toBe(-1);
    expect(empty.position(0)).toBeNaN();
  });

  it('point scale has zero bandwidth', () => {
    const s = createPointScale({ domain: ['a', 'b', 'c'], range: [0, 200], padding: 0 });
    expect(s.bandwidth).toBe(0);
    expect([0, 1, 2].map((i) => s.center(i))).toEqual([0, 100, 200]);
  });
});

describe('createOrdinalScale', () => {
  it('keeps assignments stable when keys disappear', () => {
    const s = createOrdinalScale({ domain: ['a', 'b', 'c'], range: ['red', 'green', 'blue'] });
    expect(s.map('c')).toBe('blue');
    expect(s.map('a')).toBe('red');
    expect(s.map('new')).toBe('red'); // appended at index 3 → cycles
  });

  it('returns the unknown value when configured', () => {
    const s = createOrdinalScale({ domain: ['a'], range: [1], unknown: 0 });
    expect(s.map('zzz')).toBe(0);
  });
});

describe('time scale', () => {
  const day = 864e5;
  const t0 = Date.UTC(2025, 0, 1);

  it('chooses calendar intervals by span', () => {
    expect(chooseTimeInterval(30 * day, 6)).toEqual({ unit: 'week', step: 1 });
    expect(chooseTimeInterval(365 * day, 12)).toEqual({ unit: 'month', step: 1 });
    expect(chooseTimeInterval(365 * day, 5)).toEqual({ unit: 'month', step: 3 });
    expect(chooseTimeInterval(36e5 * 24, 6)).toEqual({ unit: 'hour', step: 3 });
    expect(chooseTimeInterval(20 * 365 * day, 5).unit).toBe('year');
  });

  it('creates month-aligned ticks in UTC', () => {
    const ticks = timeTicks(t0, Date.UTC(2025, 11, 31), 12, { utc: true });
    expect(ticks).toHaveLength(12);
    expect(new Date(ticks[1] as number).toISOString()).toBe('2025-02-01T00:00:00.000Z');
  });

  it('floors to week starts (Monday by default)', () => {
    const wed = Date.UTC(2025, 0, 8, 15);
    expect(new Date(floorTime(wed, { unit: 'week', step: 1 }, { utc: true })).toISOString()).toBe(
      '2025-01-06T00:00:00.000Z',
    );
    expect(
      new Date(
        floorTime(wed, { unit: 'week', step: 1 }, { utc: true, weekStartsOn: 0 }),
      ).toISOString(),
    ).toBe('2025-01-05T00:00:00.000Z');
  });

  it('maps dates and formats ticks per locale', () => {
    const s = createTimeScale({
      domain: [new Date(t0), new Date(t0 + 10 * day)],
      range: [0, 100],
      utc: true,
    });
    expect(s.map(t0 + 5 * day)).toBe(50);
    expect(s.invert(100)).toBe(t0 + 10 * day);
    const fmt = s.tickFormat(5, 'ru');
    expect(fmt(Date.UTC(2025, 0, 3))).toMatch(/3 янв/);
    const yearFmt = createTimeScale({
      domain: [t0, Date.UTC(2026, 6, 1)],
      range: [0, 1],
      utc: true,
    }).tickFormat(6, 'en');
    expect(yearFmt(Date.UTC(2026, 0, 1))).toBe('2026');
  });

  it('handles a single-instant domain', () => {
    const s = createTimeScale({ domain: [t0, t0], range: [0, 100] });
    expect(s.map(t0)).toBe(50);
    expect(s.ticks()).toEqual([t0]);
  });
});
