import { describe, expect, it } from 'vitest';
import type { HierarchyInput } from '../algorithms/treemap';
import { estimateTextWidth } from '../formatting/text';
import { batchMarks } from '../scene/draw';
import type { RectMark } from '../scene/marks';
import { buildTreemapModel, type TreemapModelSpec } from './treemap';

const COLORS = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
const shop: HierarchyInput = {
  name: 'Shop',
  children: [
    {
      name: 'Electronics',
      children: [
        {
          name: 'Phones',
          children: [
            { name: 'Basic', value: 120 },
            { name: 'Smart', value: 480 },
          ],
        },
        { name: 'Laptops', value: 300 },
        { name: 'Audio', value: 100 },
      ],
    },
    {
      name: 'Grocery',
      children: [
        { name: 'Fruit', value: 200 },
        { name: 'Bakery', value: 150 },
        { name: 'Dairy', value: 50 },
      ],
    },
    { name: 'Books', value: 100 },
    { name: 'Garden', value: 0 },
    { name: 'Broken', value: -40 },
    { name: 'Unknown', value: Number.NaN },
  ],
};
const spec = <N extends HierarchyInput>(
  data: N,
  extra: Partial<TreemapModelSpec<N>> = {},
): TreemapModelSpec<N> => ({ width: 600, height: 400, data, colors: COLORS, ...extra });
const area = (t: { x0: number; y0: number; x1: number; y1: number }) =>
  (t.x1 - t.x0) * (t.y1 - t.y0);
const leafTiles = (m: ReturnType<typeof buildTreemapModel>) => m.leaves.map((i) => m.tiles[i]!);
const byName = (m: ReturnType<typeof buildTreemapModel>, name: string) =>
  m.tiles.find((t) => t.name === name)!;

/** Tiles inside the plot and leaves never overlapping each other. */
function expectValidLayout(m: ReturnType<typeof buildTreemapModel>) {
  const eps = 1e-6;
  for (const t of m.tiles) {
    expect(t.x0).toBeGreaterThanOrEqual(m.plot.x - eps);
    expect(t.y0).toBeGreaterThanOrEqual(m.plot.y - eps);
    expect(t.x1).toBeLessThanOrEqual(m.plot.x + m.plot.width + eps);
    expect(t.y1).toBeLessThanOrEqual(m.plot.y + m.plot.height + eps);
    const p = m.tiles[t.parent];
    if (p) {
      expect(t.x0).toBeGreaterThanOrEqual(p.x0 - eps);
      expect(t.x1).toBeLessThanOrEqual(p.x1 + eps);
      expect(t.y0).toBeGreaterThanOrEqual(p.y0 + (p.header ? m.headerHeight : 0) - eps);
      expect(t.y1).toBeLessThanOrEqual(p.y1 + eps);
    }
  }
  const l = leafTiles(m);
  for (let i = 0; i < l.length; i++)
    for (let j = i + 1; j < Math.min(l.length, i + 60); j++) {
      const a = l[i]!;
      const b = l[j]!;
      const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
      const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      expect(ox <= eps || oy <= eps).toBe(true);
    }
}

describe('treemap model: layout', () => {
  it('ignores zero, negative and missing values', () => {
    const m = buildTreemapModel(spec(shop));
    expect(m.total).toBe(1500);
    expect(m.tiles.map((t) => t.name)).not.toContain('Garden');
    expect(m.tiles.map((t) => t.name)).not.toContain('Broken');
    expect(m.tiles.map((t) => t.name)).not.toContain('Unknown');
    expect(m.branches.map((b) => b.name)).toEqual([
      'Electronics',
      'Grocery',
      'Books',
      'Garden',
      'Broken',
      'Unknown',
    ]);
    expect(leafTiles(m).map((t) => t.name)).toEqual([
      'Smart',
      'Basic',
      'Laptops',
      'Audio',
      'Fruit',
      'Bakery',
      'Dairy',
      'Books',
    ]);
    expectValidLayout(m);
  });

  it('keeps leaf areas exactly proportional to values without gaps or headers', () => {
    const m = buildTreemapModel(spec(shop, { gap: 0, headers: false }));
    const k = (600 * 400) / m.total;
    for (const t of leafTiles(m)) expect(area(t) / (t.value * k)).toBeCloseTo(1, 9);
  });

  it('compensates header strips so leaf areas stay proportional across categories', () => {
    const m = buildTreemapModel(spec(shop, { gap: 0 }));
    expect(m.tiles.filter((t) => t.header).map((t) => t.name)).toContain('Electronics');
    const ratios = leafTiles(m).map((t) => area(t) / t.value);
    const spread = Math.max(...ratios) / Math.min(...ratios);
    expect(spread).toBeLessThan(1.01);
    // Without compensation small headed categories lose noticeably more area.
    const raw = buildTreemapModel(spec(shop, { gap: 0, proportional: false }));
    const rawRatios = leafTiles(raw).map((t) => area(t) / t.value);
    expect(Math.max(...rawRatios) / Math.min(...rawRatios)).toBeGreaterThan(spread);
  });

  it('keeps areas proportional within tolerance with default 2px gaps', () => {
    const m = buildTreemapModel(spec(shop, { width: 900, height: 500 }));
    const ratios = leafTiles(m).map((t) => area(t) / t.value);
    expect(Math.max(...ratios) / Math.min(...ratios)).toBeLessThan(1.15);
    expectValidLayout(m);
    // Sibling tiles are separated by the 2px surface gap.
    const fruit = byName(m, 'Fruit');
    const bakery = byName(m, 'Bakery');
    const dx = Math.max(bakery.x0 - fruit.x1, fruit.x0 - bakery.x1);
    const dy = Math.max(bakery.y0 - fruit.y1, fruit.y0 - bakery.y1);
    expect(Math.max(dx, dy)).toBeCloseTo(2);
  });

  it('colours by top-level category and reserves headers only where there is room', () => {
    const m = buildTreemapModel(spec(shop));
    for (const t of m.tiles) expect(t.color).toBe(COLORS[t.branch]);
    expect(byName(m, 'Smart').branch).toBe(0);
    expect(byName(m, 'Books').branch).toBe(2);
    const tiny = buildTreemapModel(spec(shop, { width: 60, height: 40 }));
    expect(tiny.tiles.some((t) => t.header)).toBe(false);
    expectValidLayout(tiny);
  });

  it('handles a single node, an empty tree and deep trees', () => {
    const single = buildTreemapModel(
      spec({ name: 'root', children: [{ name: 'Only', value: 5 }] }),
    );
    expect(single.tiles).toHaveLength(1);
    expect(area(single.tiles[0]!)).toBeCloseTo(600 * 400);
    const leafRoot = buildTreemapModel(spec({ name: 'lonely', value: 3 }));
    expect(leafRoot.tiles).toHaveLength(0);
    expect(leafRoot.hitTest(10, 10)).toBe(-1);
    const empty = buildTreemapModel(spec({ name: 'root', children: [] }));
    expect(empty.marks).toEqual([]);

    let deep: HierarchyInput = { name: 'L9', value: 1 };
    for (let d = 8; d >= 1; d--)
      deep = { name: `L${d}`, children: [deep, { name: `S${d}`, value: d }] };
    const m = buildTreemapModel(spec({ name: 'root', children: [deep] }));
    expect(Math.max(...m.tiles.map((t) => t.depth))).toBe(9);
    expectValidLayout(m);
  });

  it('hides a branch toggled off in the legend and re-lays out the rest', () => {
    const m = buildTreemapModel(spec(shop, { hidden: new Set(['Electronics']) }));
    expect(m.total).toBe(500);
    expect(m.tiles.some((t) => t.branch === 0)).toBe(false);
    expect(m.branches[0]!.hidden).toBe(true);
    expect(m.branches[0]!.value).toBe(1000);
    const covered = m.tiles.filter((t) => t.parent < 0).reduce((s, t) => s + area(t), 0);
    expect(covered).toBeGreaterThan(600 * 400 * 0.97);
  });

  it('zooms into a focused branch', () => {
    const m = buildTreemapModel(spec(shop, { focus: 'Electronics', top: 30 }));
    expect(m.focus.path).toEqual(['Electronics']);
    expect(m.focus.value).toBe(1000);
    expect(m.tiles.every((t) => t.branch === 0)).toBe(true);
    expect(m.tiles.map((t) => t.name)).not.toContain('Electronics');
    expect(Math.min(...m.tiles.map((t) => t.y0))).toBeCloseTo(30);
    expectValidLayout(m);
    // Unknown keys and leaves fall back to the whole tree.
    expect(buildTreemapModel(spec(shop, { focus: 'Nope' })).focus.key).toBeNull();
    expect(buildTreemapModel(spec(shop, { focus: 'Books' })).focus.key).toBeNull();
    const deeper = buildTreemapModel(spec(shop, { focus: 'Electronics/Phones' }));
    expect(deeper.focus.path).toEqual(['Electronics', 'Phones']);
    expect(deeper.leaves).toHaveLength(2);
  });

  it('keeps duplicate sibling names apart', () => {
    const m = buildTreemapModel(
      spec({
        name: 'r',
        children: [
          { name: 'x', value: 1 },
          { name: 'x', value: 2 },
        ],
      }),
    );
    expect(new Set(m.tiles.map((t) => t.key))).toEqual(new Set(['x', 'x#1']));
  });
});

describe('treemap model: labels', () => {
  it('labels leaves that fit with name and value, truncates or skips the rest', () => {
    const m = buildTreemapModel(
      spec({
        name: 'r',
        children: [
          { name: 'Very large category', value: 900 },
          { name: 'A rather long leaf name for its tile', value: 60 },
          { name: 'Tiny', value: 0.5 },
        ],
      }),
    );
    const text = (k: string) => m.labels.find((l) => l.key === k)?.text;
    expect(text('leaf|Very large category')).toBe('Very large category');
    expect(text('leafv|Very large category')).toBe('900');
    const long = text('leaf|A rather long leaf name for its tile')!;
    expect(long.endsWith('…')).toBe(true);
    const t = byName(m, 'A rather long leaf name for its tile');
    expect(estimateTextWidth(long, 11)).toBeLessThanOrEqual(t.x1 - t.x0 - 12);
    expect(text('leaf|Tiny')).toBeUndefined();
    const big = m.labels.find((l) => l.key === 'leaf|Very large category')!;
    expect(big.fill).toBe('var(--jc-on-fill)');
  });

  it('uses readable ink on fills and the theme text on headers', () => {
    const m = buildTreemapModel({
      ...spec(shop, { width: 900, height: 500 }),
      colors: ['var(--jc-series-1)', '#0f172a', '#fde68a'],
    });
    const leaf = (k: string) => m.labels.find((l) => l.key === `leaf|${k}`);
    expect(leaf('Electronics/Laptops')?.fill).toBe('var(--jc-on-fill)');
    expect(leaf('Grocery/Fruit')?.fill).toBe('#ffffff');
    const head = m.labels.find((l) => l.key === 'head|Electronics')!;
    expect(head.tone).toBe('primary');
    expect(head.text).toBe('Electronics · 1,000');
  });
});

describe('treemap model: interaction and performance', () => {
  it('hit tests the deepest tile, headers and gaps', () => {
    const m = buildTreemapModel(spec(shop, { width: 900, height: 500 }));
    const smart = byName(m, 'Smart');
    const i = m.tiles.indexOf(smart);
    expect(m.hitTest((smart.x0 + smart.x1) / 2, (smart.y0 + smart.y1) / 2)).toBe(i);
    const phones = byName(m, 'Phones');
    expect(phones.header).toBe(true);
    expect(m.hitTest(phones.x0 + 10, phones.y0 + 5)).toBe(m.tiles.indexOf(phones));
    // A point in the gap between two leaves resolves to one of them, not to nothing.
    const basic = byName(m, 'Basic');
    const hit = m.tiles[m.hitTest(smart.x1 + 1, (basic.y0 + basic.y1) / 2)];
    expect(hit?.leaf).toBe(true);
    expect(m.hitTest(-5, 10)).toBe(-1);
    expect(m.hitTest(950, 10)).toBe(-1);
  });

  it('provides active marks and spatial neighbours', () => {
    const m = buildTreemapModel(spec(shop, { width: 900, height: 500 }));
    const smart = m.tiles.findIndex((t) => t.name === 'Smart');
    const marks = m.activeMarks(smart);
    expect(marks[0]!.key).toBe('active|Electronics/Phones/Smart');
    expect(marks[1]!.fill).toBe('none');
    const phones = m.tiles.findIndex((t) => t.name === 'Phones');
    expect(m.leafMarks(phones)).toHaveLength(2);
    expect(m.activeMarks(phones)[0]!.key).toBe('active-head|Electronics/Phones');
    for (const dir of ['up', 'down', 'left', 'right'] as const) {
      const n = m.neighbor(smart, dir);
      if (n < 0) continue;
      const a = m.tiles[smart]!;
      const b = m.tiles[n]!;
      if (dir === 'right') expect(b.x0).toBeGreaterThanOrEqual(a.x1 - 1);
      if (dir === 'left') expect(b.x1).toBeLessThanOrEqual(a.x0 + 1);
      if (dir === 'down') expect(b.y0).toBeGreaterThanOrEqual(a.y1 - 1);
      if (dir === 'up') expect(b.y1).toBeLessThanOrEqual(a.y0 + 1);
    }
  });

  it('keeps the element count low for 2,000 leaves', () => {
    const data: HierarchyInput = {
      name: 'root',
      children: Array.from({ length: 8 }, (_, g) => ({
        name: `Group ${g}`,
        children: Array.from({ length: 10 }, (_, s) => ({
          name: `Sub ${s}`,
          children: Array.from({ length: 25 }, (_, l) => ({
            name: `Leaf ${l}`,
            value: 1 + ((g * 31 + s * 7 + l * 13) % 97),
          })),
        })),
      })),
    };
    const t0 = performance.now();
    const m = buildTreemapModel(spec(data, { width: 1000, height: 600 }));
    const elapsed = performance.now() - t0;
    expect(m.leaves).toHaveLength(2000);
    expect(m.marks.length).toBeGreaterThan(1900); // sub-gap tiles are not drawn
    const batches = batchMarks(m.marks);
    expect(batches.length).toBeLessThanOrEqual(8 * 3);
    expect(elapsed).toBeLessThan(500);
    expectValidLayout(m);
    // Hit testing descends the hierarchy.
    const leaf = m.tiles[m.leaves[1234]!]!;
    expect(m.hitTest((leaf.x0 + leaf.x1) / 2, (leaf.y0 + leaf.y1) / 2)).toBe(m.leaves[1234]);
    const rects = m.marks.filter((x): x is RectMark => x.type === 'rect');
    // Corners shrink on tiny tiles (no pills) and never exceed 3px.
    expect(rects.every((r) => typeof r.radius === 'number' && r.radius <= 3)).toBe(true);
    expect(rects.some((r) => r.radius === 3)).toBe(true);
  });
});

describe('treemap model: refinements', () => {
  it('fits semibold labels inside their tiles', () => {
    const m = buildTreemapModel(spec(shop, { width: 520, height: 300 }));
    for (const l of m.labels) {
      const key = l.key.slice(l.key.indexOf('|') + 1);
      const t = m.tiles.find((x) => x.key === key)!;
      expect(estimateTextWidth(l.text, 11) * (l.fontWeight === 600 ? 1.1 : 1)).toBeLessThanOrEqual(
        t.x1 - t.x0 - 12 + 1e-9,
      );
    }
  });

  it('avoids a patchy mix of headers on dense inner levels', () => {
    const data: HierarchyInput = {
      name: 'root',
      children: Array.from({ length: 4 }, (_, g) => ({
        name: `G${g}`,
        children: Array.from({ length: 12 }, (_, s) => ({
          name: `S${s}`,
          children: Array.from({ length: 6 }, (_, l) => ({ name: `L${l}`, value: 1 + s + l })),
        })),
      })),
    };
    const m = buildTreemapModel(spec(data, { width: 600, height: 400 }));
    for (const g of m.tiles.filter((t) => t.depth === 1)) {
      const kids = g.children.map((i) => m.tiles[i]!);
      const withHeader = kids.filter((k) => k.header).length;
      expect(withHeader === 0 || withHeader * 2 >= kids.length).toBe(true);
    }
    expect(m.tiles.filter((t) => t.depth === 1).every((t) => t.header)).toBe(true);
  });

  it('returns the labels of a tile and its descendants', () => {
    const m = buildTreemapModel(spec(shop, { width: 900, height: 500 }));
    const electronics = m.tiles.findIndex((t) => t.name === 'Electronics');
    const keys = m.labelsOf(electronics).map((l) => l.key);
    expect(keys).toContain('head|Electronics');
    expect(keys).toContain('leaf|Electronics/Phones/Smart');
    expect(keys.some((k) => k.includes('Grocery'))).toBe(false);
  });
});
