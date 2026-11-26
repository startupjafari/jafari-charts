import { describe, expect, it } from 'vitest';
import { estimateTextWidth } from '../formatting/text';
import type { LineMark, Mark, PolygonMark, SymbolMark } from '../scene/marks';
import {
  buildRadarModel,
  radarLabelPlacement,
  type RadarSeriesSpec,
  type RadarSpec,
} from './radar';

const f = (...v: number[]) => Float64Array.from(v);
const series = (id: string, values: Float64Array, extra: Partial<RadarSeriesSpec> = {}) => ({
  id,
  label: id,
  color: `var(--${id})`,
  values,
  ...extra,
});
const spec = (s: RadarSeriesSpec[], extra: Partial<RadarSpec> = {}): RadarSpec => ({
  width: 500,
  height: 400,
  metrics: ['Speed', 'Power', 'Range', 'Comfort'],
  series: s,
  ...extra,
});
const byType = <T extends Mark['type']>(marks: Mark[], type: T) =>
  marks.filter((m): m is Extract<Mark, { type: T }> => m.type === type);

describe('radar model', () => {
  it('places vertices at known values along clockwise spokes from 12 o’clock', () => {
    const m = buildRadarModel(spec([series('a', f(100, 50, 0, 25))], { max: 100 }));
    const { cx, cy, radius: R } = m;
    expect(R).toBeGreaterThan(100);
    const p = (i: number) => m.point(0, i)!;
    expect(p(0).x).toBeCloseTo(cx);
    expect(p(0).y).toBeCloseTo(cy - R);
    expect(p(1).x).toBeCloseTo(cx + R / 2);
    expect(p(1).y).toBeCloseTo(cy);
    expect(p(2).x).toBeCloseTo(cx);
    expect(p(2).y).toBeCloseTo(cy);
    expect(p(3).x).toBeCloseTo(cx - R / 4); // left spoke
    expect(p(3).y).toBeCloseTo(cy);
    // One fill polygon (low opacity), one 2px outline, one marker batch.
    const fill = byType(m.marks, 'polygon')[0] as PolygonMark;
    expect(fill.fillOpacity).toBeGreaterThanOrEqual(0.12);
    expect(fill.fillOpacity).toBeLessThanOrEqual(0.18);
    const outline = byType(m.marks, 'line')[0] as LineMark;
    expect(outline.strokeWidth).toBe(2);
    expect(outline.xs).toHaveLength(5); // closed: first vertex repeated
    expect(outline.xs[4]).toBeCloseTo(outline.xs[0]!);
    expect(byType(m.marks, 'symbol')[0]!.xs).toHaveLength(4);
  });

  it('picks a nice maximum with 4–5 rings and labels them along the first spoke', () => {
    const m = buildRadarModel(
      spec([series('a', f(87, 40, 12, 66)), series('b', f(20, 70, 30, 9))]),
    );
    expect(m.domain).toEqual([0, 100]);
    expect(m.rings.map((r) => r.value)).toEqual([20, 40, 60, 80, 100]);
    expect(m.rings.at(-1)!.radius).toBeCloseTo(m.radius);
    expect(m.tickLabels.map((t) => t.text)).toEqual(['20', '40', '60', '80', '100']);
    for (const t of m.tickLabels) expect(t.x).toBeCloseTo(m.cx + 4);
    // Grid: one ring per level plus one spoke per metric.
    expect(byType(m.grid, 'line')).toHaveLength(5);
    expect(byType(m.grid, 'rule')).toHaveLength(4);
    // Explicit max and levels.
    const fixed = buildRadarModel(spec([series('a', f(3, 4, 5, 6))], { max: 10, levels: 4 }));
    expect(fixed.rings.map((r) => r.value)).toEqual([2.5, 5, 7.5, 10]);
  });

  it('supports negative values with the minimum at the centre and an emphasised zero ring', () => {
    const m = buildRadarModel(spec([series('a', f(-20, 50, 80, 10))]));
    expect(m.domain[0]).toBeLessThan(0);
    expect(m.radiusOf(m.domain[0])).toBe(0);
    expect(m.radiusOf(0)).toBeGreaterThan(0);
    expect(m.grid.some((g) => g.key === 'ring|zero' && g.stroke === 'var(--jc-axis)')).toBe(true);
    // A fixed minimum clamps lower values to the centre; a fixed max clamps at the edge.
    const clamped = buildRadarModel(spec([series('a', f(-20, 150, 80, 10))], { min: 0, max: 100 }));
    expect(clamped.point(0, 0)).toEqual({ x: clamped.cx, y: clamped.cy });
    expect(
      Math.hypot(clamped.point(0, 1)!.x - clamped.cx, clamped.point(0, 1)!.y - clamped.cy),
    ).toBeCloseTo(clamped.radius);
  });

  it('breaks the outline at missing values and fills only where the outline exists', () => {
    const m = buildRadarModel(spec([series('a', f(10, NaN, 30, 40))]));
    expect(m.point(0, 1)).toBeNull();
    const outline = byType(m.marks, 'line')[0] as LineMark;
    expect(Number.isNaN(outline.xs[1]!)).toBe(true);
    // One fan from the centre over the run 2 → 3 → 0 (wrapping), never a chord 0 → 2.
    const fills = byType(m.marks, 'polygon');
    expect(fills).toHaveLength(1);
    expect(fills[0]!.xs).toHaveLength(4);
    expect(fills[0]!.xs[0]).toBeCloseTo(m.cx);
    expect(fills[0]!.ys[0]).toBeCloseTo(m.cy);
    expect(fills[0]!.xs[3]).toBeCloseTo(m.point(0, 0)!.x);
    expect(Array.from((byType(m.marks, 'symbol')[0] as SymbolMark).indices ?? [])).toEqual([
      0, 2, 3,
    ]);
    // Two gaps split the fill into separate fans; isolated vertices get no fill.
    const split = buildRadarModel(
      spec([series('a', f(1, 2, NaN, 4, 5, NaN))], { metrics: ['a', 'b', 'c', 'd', 'e', 'f'] }),
    );
    expect(byType(split.marks, 'polygon').map((p) => p.xs.length)).toEqual([3, 3]);
  });

  it('renders fewer than three metrics sensibly (circles, segment, dot)', () => {
    const two = buildRadarModel(spec([series('a', f(3, 5))], { metrics: ['A', 'B'] }));
    expect(byType(two.grid, 'arc').length).toBeGreaterThan(0); // circular rings
    expect(byType(two.marks, 'polygon')).toHaveLength(0);
    expect((byType(two.marks, 'line')[0] as LineMark).xs).toHaveLength(2);
    const one = buildRadarModel(spec([series('a', f(3))], { metrics: ['A'], dots: false }));
    expect(byType(one.marks, 'line')).toHaveLength(0);
    expect(byType(one.marks, 'symbol')[0]!.xs).toHaveLength(1);
    const none = buildRadarModel(spec([series('a', f())], { metrics: [] }));
    expect(none.marks).toEqual([]);
    expect(none.hitTest(10, 10)).toBe(-1);
    // Circle option for many metrics.
    const circle = buildRadarModel(spec([series('a', f(1, 2, 3, 4))], { shape: 'circle' }));
    expect(byType(circle.grid, 'arc').length).toBe(circle.rings.length);
  });

  it('hit tests by angle: the nearest spoke owns its sector', () => {
    const m = buildRadarModel(spec([series('a', f(1, 2, 3, 4))]));
    const { cx, cy, radius: R } = m;
    expect(m.hitTest(cx + 2, cy - R * 0.5)).toBe(0); // just right of the top spoke
    expect(m.hitTest(cx + R * 0.6, cy - R * 0.2)).toBe(1); // right
    expect(m.hitTest(cx - 1, cy + R * 0.9)).toBe(2); // bottom
    expect(m.hitTest(cx - R * 0.8, cy + 5)).toBe(3); // left
    expect(m.hitTest(cx - R * 0.3, cy - R * 0.7)).toBe(0); // upper left still nearest the top
    expect(m.hitTest(cx + R * 3, cy)).toBe(-1);
  });

  it('anchors labels away from the centre and truncates long ones to fit', () => {
    expect(radarLabelPlacement(0)).toEqual({ anchor: 'middle', baseline: 'auto' });
    expect(radarLabelPlacement(Math.PI / 2)).toEqual({ anchor: 'start', baseline: 'middle' });
    expect(radarLabelPlacement(Math.PI)).toEqual({ anchor: 'middle', baseline: 'hanging' });
    expect(radarLabelPlacement((3 * Math.PI) / 2)).toEqual({ anchor: 'end', baseline: 'middle' });

    const long = 'An extremely long metric name that cannot possibly fit beside the chart';
    const m = buildRadarModel(
      spec([series('a', f(1, 2, 3, 4, 5, 6))], {
        width: 320,
        height: 260,
        metrics: [long, long, 'Short', long, long, long],
      }),
    );
    expect(m.radius).toBeGreaterThan(260 * 0.25);
    for (const l of m.labels) {
      const w = estimateTextWidth(l.text, 11);
      const left = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - w : l.x - w / 2;
      expect(left).toBeGreaterThanOrEqual(-0.5);
      expect(left + w).toBeLessThanOrEqual(320.5);
    }
    expect(m.labels.some((l) => l.text.endsWith('…'))).toBe(true);
    expect(m.labels.find((l) => l.key === 'metric|2')!.text).toBe('Short');
  });

  it('excludes hidden datasets from marks and the domain; handles many datasets', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      series(`s${i}`, f(i, i + 1, i + 2, i + 3), { visible: i !== 9 }),
    );
    const m = buildRadarModel(spec(many));
    expect(m.domain[1]).toBe(12); // 11 is the visible maximum
    expect(new Set(m.marks.map((x) => x.series)).size).toBe(9);
    expect(m.point(9, 0)).toBeNull();
  });
});
