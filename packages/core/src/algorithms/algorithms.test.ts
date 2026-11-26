import { describe, expect, it } from 'vitest';
import { KDTree } from './kdtree';
import { bisectLeft, bisectRight, extent, extentOf, nearestIndex } from './search';
import { hierarchy, treemap } from './treemap';

describe('binary search', () => {
  const v = [1, 2, 2, 2, 5, 9];
  it('finds insertion points', () => {
    expect(bisectLeft(v, 2)).toBe(1);
    expect(bisectRight(v, 2)).toBe(4);
    expect(bisectLeft(v, 0)).toBe(0);
    expect(bisectLeft(v, 10)).toBe(6);
  });

  it('finds the nearest value', () => {
    expect(nearestIndex(v, 3)).toBe(3);
    expect(nearestIndex(v, 4)).toBe(4);
    expect(nearestIndex(v, -100)).toBe(0);
    expect(nearestIndex(v, 100)).toBe(5);
    expect(nearestIndex([], 1)).toBe(-1);
    expect(nearestIndex(v, Number.NaN)).toBe(-1);
  });

  it('scales to a million points', () => {
    const big = Float64Array.from({ length: 1_000_000 }, (_, i) => i * 2);
    expect(nearestIndex(big, 1_234_567)).toBe(617_283);
  });

  it('computes extents ignoring NaN', () => {
    expect(extent([3, Number.NaN, -1, 7])).toEqual([-1, 7]);
    expect(extent([])).toEqual([Number.NaN, Number.NaN]);
    expect(extentOf([[1, 2], [Number.NaN], [-5]])).toEqual([-5, 2]);
  });
});

describe('KDTree', () => {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const n = 5000;
  const xs = Float64Array.from({ length: n }, () => rnd() * 1000);
  const ys = Float64Array.from({ length: n }, () => rnd() * 600);
  xs[10] = Number.NaN; // invalid point must be ignored
  const tree = new KDTree(xs, ys);

  function brute(x: number, y: number) {
    let best = -1;
    let bd = Infinity;
    for (let i = 0; i < n; i++) {
      const d = (xs[i]! - x) ** 2 + (ys[i]! - y) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return best;
  }

  it('matches brute force nearest neighbour', () => {
    expect(tree.size).toBe(n - 1);
    for (let q = 0; q < 200; q++) {
      const x = rnd() * 1100 - 50;
      const y = rnd() * 700 - 50;
      expect(tree.nearest(x, y)).toBe(brute(x, y));
    }
  });

  it('respects the maximum distance', () => {
    expect(tree.nearest(-10_000, -10_000, 5)).toBe(-1);
  });

  it('finds all points within a radius', () => {
    const found = new Set(tree.within(500, 300, 40));
    for (let i = 0; i < n; i++) {
      const inside = (xs[i]! - 500) ** 2 + (ys[i]! - 300) ** 2 <= 1600;
      expect(found.has(i)).toBe(inside);
    }
  });

  it('handles empty input', () => {
    expect(new KDTree([], []).nearest(0, 0)).toBe(-1);
  });
});

describe('treemap', () => {
  const data = {
    name: 'root',
    children: [
      { name: 'a', value: 6 },
      { name: 'b', value: 6 },
      { name: 'c', value: 4 },
      {
        name: 'd',
        children: [
          { name: 'd1', value: 3 },
          { name: 'd2', value: 1 },
        ],
      },
      { name: 'zero', value: 0 },
      { name: 'neg', value: -5 },
    ],
  };

  it('sums values bottom-up ignoring invalid ones', () => {
    const root = hierarchy(data);
    expect(root.value).toBe(20);
    expect(root.children[3]!.value).toBe(4);
  });

  it('gives each leaf an area proportional to its value', () => {
    const root = hierarchy(data);
    const nodes = treemap(root, { x: 0, y: 0, width: 600, height: 400 }, { paddingInner: 0 });
    const area = (n: (typeof nodes)[number]) => (n.x1 - n.x0) * (n.y1 - n.y0);
    const total = 600 * 400;
    for (const n of nodes.filter((n) => !n.children.length && n.value > 0)) {
      expect(area(n) / total).toBeCloseTo(n.value / 20, 5);
      expect(n.x0).toBeGreaterThanOrEqual(-1e-9);
      expect(n.x1).toBeLessThanOrEqual(600 + 1e-9);
      expect(n.y1).toBeLessThanOrEqual(400 + 1e-9);
    }
    const zero = nodes.find((n) => n.data.name === 'zero')!;
    expect(area(zero)).toBe(0);
  });

  it('produces reasonably square tiles', () => {
    const many = {
      name: 'r',
      children: Array.from({ length: 30 }, (_, i) => ({ name: `n${i}`, value: 1 + (i % 5) })),
    };
    const nodes = treemap(
      hierarchy(many),
      { x: 0, y: 0, width: 800, height: 500 },
      { paddingInner: 0 },
    ).slice(1);
    const ratios = nodes.map((n) => {
      const w = n.x1 - n.x0;
      const h = n.y1 - n.y0;
      return Math.max(w / h, h / w);
    });
    expect(Math.max(...ratios)).toBeLessThan(4);
  });
});
