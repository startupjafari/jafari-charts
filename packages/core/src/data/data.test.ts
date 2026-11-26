import { describe, expect, it } from 'vitest';
import { detectDimensionType, labelColumn, numericColumn, timeColumn } from './columns';
import { downsample, lttb, minMaxDownsample } from './downsample';
import { groupBy, isSortedAscending, permute, sortIndices } from './group';
import { stack, sum, toShares } from './stack';
import { isDateString, toNumber, toTime } from './values';

describe('toNumber', () => {
  it('accepts finite numbers, numeric strings, bigints and dates', () => {
    expect(toNumber(3.5)).toBe(3.5);
    expect(toNumber(' 42 ')).toBe(42);
    expect(toNumber(10n)).toBe(10);
    expect(toNumber(new Date(1000))).toBe(1000);
  });

  it('turns everything unplottable into NaN', () => {
    for (const v of [
      null,
      undefined,
      Number.NaN,
      Infinity,
      -Infinity,
      '',
      'abc',
      {},
      [],
      true,
      new Date('x'),
    ]) {
      expect(toNumber(v)).toBeNaN();
    }
  });
});

describe('toTime', () => {
  it('reads date-only strings as local midnight', () => {
    const t = toTime('2025-03-01');
    const d = new Date(t);
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2025, 2, 1, 0]);
    expect(new Date(toTime('2025-03')).getDate()).toBe(1);
  });

  it('parses ISO timestamps and rejects garbage', () => {
    expect(toTime('2025-03-01T10:00:00Z')).toBe(Date.UTC(2025, 2, 1, 10));
    expect(toTime('not a date')).toBeNaN();
    expect(toTime(null)).toBeNaN();
    expect(isDateString('2025-03-01')).toBe(true);
    expect(isDateString('Q1 2025')).toBe(false);
  });
});

describe('columns', () => {
  const data = [
    { day: '2025-01-01', v: 1, cat: 'a' },
    { day: '2025-01-02', v: null, cat: 'b' },
    { day: '2025-01-03', v: 3, cat: 'c' },
  ];

  it('detects dimension types', () => {
    expect(detectDimensionType(data, 'day')).toBe('time');
    expect(detectDimensionType(data, 'v')).toBe('number');
    expect(detectDimensionType(data, 'cat')).toBe('category');
    expect(detectDimensionType([{ d: new Date() }], 'd')).toBe('time');
    expect(detectDimensionType([], 'x' as never)).toBe('category');
    // Integer epoch milliseconds are time; other large numbers stay numeric.
    expect(
      detectDimensionType([{ t: Date.UTC(2025, 0, 1) }, { t: Date.UTC(2025, 0, 2) }], 't'),
    ).toBe('time');
    expect(detectDimensionType([{ t: 1.5e12 + 0.5 }], 't')).toBe('number');
    expect(detectDimensionType([{ t: 5e15 }], 't')).toBe('number');
  });

  it('extracts typed columns with gaps', () => {
    const v = numericColumn(data, 'v');
    expect(Array.from(v)).toEqual([1, Number.NaN, 3]);
    expect(timeColumn(data, 'day')[2]).toBe(new Date(2025, 0, 3).getTime());
    expect(labelColumn(data, (d) => d.cat.toUpperCase())).toEqual(['A', 'B', 'C']);
  });
});

describe('stack', () => {
  const a = Float64Array.from([1, -2, 3]);
  const b = Float64Array.from([2, 4, Number.NaN]);

  it('diverging: positives up, negatives down', () => {
    const { y0, y1 } = stack([a, b], 'diverging');
    expect(Array.from(y0[0]!)).toEqual([0, -2, 0]);
    expect(Array.from(y1[0]!)).toEqual([1, 0, 3]);
    expect(Array.from(y0[1]!)).toEqual([1, 0, 3]);
    expect(Array.from(y1[1]!)).toEqual([3, 4, 3]); // NaN contributes zero height
  });

  it('zero: plain cumulative sum', () => {
    const { y1 } = stack([a, b], 'zero');
    expect(Array.from(y1[1]!)).toEqual([3, 2, 3]);
  });

  it('expand: magnitudes sum to one', () => {
    const { y0, y1 } = stack([a, b], 'expand');
    expect(y1[1]![0]).toBeCloseTo(1);
    // Column 1: |−2| + |4| = 6 → −1/3 below zero, 2/3 above.
    expect(y0[0]![1]).toBeCloseTo(-1 / 3);
    expect(y1[1]![1]).toBeCloseTo(2 / 3);
  });

  it('handles empty input and all-zero columns', () => {
    expect(stack([], 'expand')).toEqual({ y0: [], y1: [] });
    const { y1 } = stack([Float64Array.from([0, 0])], 'expand');
    expect(Array.from(y1[0]!)).toEqual([0, 0]);
  });

  it('computes shares and sums ignoring invalid values', () => {
    expect(Array.from(toShares([1, 3, Number.NaN, -1]))).toEqual([0.25, 0.75, 0, 0]);
    expect(Array.from(toShares([0, 0]))).toEqual([0, 0]);
    expect(sum([1, Number.NaN, 2])).toBe(3);
  });
});

describe('downsampling', () => {
  const n = 10_000;
  const xs = Float64Array.from({ length: n }, (_, i) => i);
  const ys = Float64Array.from(
    { length: n },
    (_, i) => Math.sin(i / 200) * 100 + (i === 5_000 ? 1_000 : 0),
  );

  it('LTTB returns the requested size and keeps endpoints and the spike', () => {
    const idx = lttb(xs, ys, 500);
    expect(idx.length).toBeLessThanOrEqual(500);
    expect(idx.length).toBeGreaterThan(450);
    expect(idx[0]).toBe(0);
    expect(idx[idx.length - 1]).toBe(n - 1);
    expect(Array.from(idx)).toContain(5_000);
    for (let i = 1; i < idx.length; i++) expect(idx[i]!).toBeGreaterThan(idx[i - 1]!);
  });

  it('min-max keeps every bucket extreme', () => {
    const idx = minMaxDownsample(xs, ys, 400);
    expect(Array.from(idx)).toContain(5_000);
    expect(idx.length).toBeLessThanOrEqual(400);
    const values = Array.from(idx, (i) => ys[i]!);
    expect(Math.min(...values)).toBe(Math.min(...ys));
    expect(Math.max(...values)).toBe(Math.max(...ys));
  });

  it('is a no-op when the threshold exceeds the data', () => {
    expect(Array.from(downsample([0, 1, 2], [1, 2, 3], 10))).toEqual([0, 1, 2]);
  });

  it('preserves gaps between defined segments', () => {
    const gx = Float64Array.from({ length: 2000 }, (_, i) => i);
    const gy = Float64Array.from({ length: 2000 }, (_, i) =>
      i >= 1000 && i < 1010 ? Number.NaN : i % 7,
    );
    const idx = lttb(gx, gy, 100);
    const kept = Array.from(idx, (i) => gy[i]!);
    expect(kept.some((v) => Number.isNaN(v))).toBe(true);
    expect(idx.length).toBeLessThan(120);
  });
});

describe('grouping and sorting', () => {
  it('groups preserving order', () => {
    const g = groupBy([{ k: 'b' }, { k: 'a' }, { k: 'b' }], 'k');
    expect([...g.keys()]).toEqual(['b', 'a']);
    expect(g.get('b')).toHaveLength(2);
  });

  it('sorts indices stably with NaN last', () => {
    const v = [3, Number.NaN, 1, 3, 2];
    expect(Array.from(sortIndices(v))).toEqual([2, 4, 0, 3, 1]);
    expect(Array.from(permute(v, sortIndices(v)))).toEqual([1, 2, 3, 3, Number.NaN]);
    expect(isSortedAscending([1, Number.NaN, 2, 2])).toBe(true);
    expect(isSortedAscending([2, 1])).toBe(false);
  });
});
