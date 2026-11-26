import { describe, expect, it } from 'vitest';
import { estimateTextWidth } from '../formatting/text';
import type { Mark, PolygonMark, RectMark, TextMark } from '../scene/marks';
import { buildFunnelModel, funnelPercent, type FunnelSpec } from './funnel';

const f = (...v: number[]) => Float64Array.from(v);
const spec = (values: number[], extra: Partial<FunnelSpec> = {}): FunnelSpec => ({
  width: 600,
  height: 300,
  values: Float64Array.from(values),
  names: values.map((_, i) => `Stage ${i + 1}`),
  ...extra,
});
const bars = (marks: Mark[]) =>
  marks.filter((m): m is RectMark => m.type === 'rect' && m.key.startsWith('stage|'));
const links = (marks: Mark[]) =>
  marks.filter((m): m is PolygonMark => m.type === 'polygon' && m.key.startsWith('link|'));
const texts = (labels: TextMark[], prefix: string) =>
  labels.filter((l) => l.key.startsWith(prefix)).map((l) => l.text);

/** Estimated text box of a label (labels are centred vertically on `y`). */
function box(l: TextMark, fs = 11) {
  const w = estimateTextWidth(l.text, fs);
  const x0 = l.anchor === 'end' ? l.x - w : l.anchor === 'middle' ? l.x - w / 2 : l.x;
  return { x0, x1: x0 + w, y0: l.y - fs / 2, y1: l.y + fs / 2 };
}
function overlaps(labels: TextMark[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < labels.length; i++)
    for (let j = i + 1; j < labels.length; j++) {
      const a = box(labels[i]!);
      const b = box(labels[j]!);
      if (a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1)
        out.push(`${labels[i]!.text} × ${labels[j]!.text}`);
    }
  return out;
}

describe('funnel model: geometry', () => {
  it('draws centred bars whose widths are proportional to the values', () => {
    const m = buildFunnelModel(spec([1000, 600, 300, 150]));
    const r = bars(m.marks);
    expect(r).toHaveLength(4);
    const full = r[0]!.width;
    expect(full).toBeGreaterThan(300);
    [1, 0.6, 0.3, 0.15].forEach((ratio, i) => expect(r[i]!.width / full).toBeCloseTo(ratio, 6));
    // Centred on one axis, ordered top → bottom, equal thickness.
    const centre = r[0]!.x + r[0]!.width / 2;
    for (const b of r) expect(b.x + b.width / 2).toBeCloseTo(centre, 6);
    for (let i = 1; i < r.length; i++) expect(r[i]!.y).toBeGreaterThan(r[i - 1]!.y);
    expect(new Set(r.map((b) => b.height.toFixed(6))).size).toBe(1);
    // Everything stays inside the chart.
    for (const b of r) {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width).toBeLessThanOrEqual(600);
      expect(b.y + b.height).toBeLessThanOrEqual(300);
    }
  });

  it('joins consecutive bars with soft trapezoid connectors', () => {
    const m = buildFunnelModel(spec([1000, 600, 300]));
    const l = links(m.marks);
    expect(l).toHaveLength(2);
    const [a, b] = bars(m.marks);
    const c = l[0]!;
    expect(c.fillOpacity).toBeLessThan(0.5);
    // Top edge matches bar 1's bottom edge, bottom edge matches bar 2's top edge.
    expect(c.ys[0]).toBeCloseTo(a!.y + a!.height);
    expect(c.ys[2]).toBeCloseTo(b!.y);
    expect(c.xs[1]! - c.xs[0]!).toBeCloseTo(a!.width);
    expect(c.xs[2]! - c.xs[3]!).toBeCloseTo(b!.width);
    // Bars and connectors share one colour by default (one series, no rainbow).
    expect(new Set(m.marks.map((x) => x.fill))).toEqual(new Set(['var(--jc-series-1)']));
  });

  it('builds one continuous shape in the trapezoid variant', () => {
    const m = buildFunnelModel(spec([1000, 500, 250], { variant: 'trapezoid' }));
    const segs = m.marks.filter((x): x is PolygonMark => x.type === 'polygon');
    expect(segs).toHaveLength(3);
    const top = (p: PolygonMark) => p.xs[1]! - p.xs[0]!;
    const bottom = (p: PolygonMark) => p.xs[2]! - p.xs[3]!;
    // Each segment starts at its own value and narrows to the next one.
    expect(top(segs[1]!) / top(segs[0]!)).toBeCloseTo(0.5, 6);
    expect(bottom(segs[0]!)).toBeCloseTo(top(segs[1]!), 6);
    expect(bottom(segs[2]!)).toBeCloseTo(top(segs[2]!), 6);
    // 2px surface gaps between segments.
    expect(segs[1]!.ys[0]! - segs[0]!.ys[2]!).toBeCloseTo(2);
  });

  it('lays stages out left → right when horizontal', () => {
    const m = buildFunnelModel(spec([400, 200, 100], { orientation: 'horizontal' }));
    const r = bars(m.marks);
    expect(r[1]!.x).toBeGreaterThan(r[0]!.x);
    expect(r[1]!.height / r[0]!.height).toBeCloseTo(0.5, 6);
    expect(r[2]!.height / r[0]!.height).toBeCloseTo(0.25, 6);
    // Names sit in a row below the columns.
    const names = m.labels.filter((l) => l.key.startsWith('name|'));
    expect(names).toHaveLength(3);
    for (const n of names) expect(n.y).toBeGreaterThan(r[0]!.y + r[0]!.height);
    expect(m.hitTest(r[2]!.x + 1, 150)).toBe(2);
  });
});

describe('funnel model: conversion math', () => {
  it('computes percentages of the first stage and drop-offs', () => {
    const m = buildFunnelModel(spec([1000, 600, 150]));
    const [a, b, c] = m.stages;
    expect(a!.ofFirst).toBe(1);
    expect(Number.isNaN(a!.dropOff)).toBe(true);
    expect(b!.ofFirst).toBeCloseTo(0.6);
    expect(b!.ofPrevious).toBeCloseTo(0.6);
    expect(c!.ofFirst).toBeCloseTo(0.15);
    expect(c!.ofPrevious).toBeCloseTo(0.25);
    expect(c!.dropOff).toBe(450);
    expect(c!.dropOffRate).toBeCloseTo(0.75);
    expect(c!.percent).toBeCloseTo(0.15);
    expect(texts(m.labels, 'value|')).toEqual(['1,000 · 100%', '600 · 60%', '150 · 15%']);
    expect(texts(m.labels, 'drop|')).toEqual(['−40% / −400', '−75% / −450']);
  });

  it('switches stage percentages to the previous stage', () => {
    const m = buildFunnelModel(spec([1000, 600, 150], { percentBase: 'previous' }));
    expect(m.stages.map((s) => s.percent)).toEqual([1, 0.6, 0.25]);
    expect(texts(m.labels, 'value|')).toEqual(['1,000 · 100%', '600 · 60%', '150 · 25%']);
  });

  it('shows growth when a stage is bigger than the previous one', () => {
    const m = buildFunnelModel(spec([400, 200, 250]));
    expect(m.stages[2]!.dropOff).toBe(-50);
    expect(texts(m.labels, 'drop|')).toContain('+25% / +50');
    // Widths are relative to the largest stage, so nothing overflows.
    expect(m.max).toBe(400);
  });

  it('uses small-percent precision', () => {
    expect(funnelPercent(0.6)).toBe('60%');
    expect(funnelPercent(0.048)).toBe('4.8%');
    expect(funnelPercent(Number.NaN)).toBe('');
  });
});

describe('funnel model: edge cases', () => {
  it('copes with zero stages and a single stage', () => {
    const empty = buildFunnelModel(spec([]));
    expect(empty.marks).toEqual([]);
    expect(empty.labels).toEqual([]);
    expect(empty.hitTest(300, 150)).toBe(-1);
    const one = buildFunnelModel(spec([42]));
    expect(bars(one.marks)).toHaveLength(1);
    expect(links(one.marks)).toHaveLength(0);
    expect(texts(one.labels, 'drop|')).toEqual([]);
    expect(texts(one.labels, 'value|')).toEqual(['42 · 100%']);
    expect(one.hitTest(300, 150)).toBe(0);
  });

  it('keeps all-zero and missing stages labelled without drawing bars', () => {
    const zeros = buildFunnelModel(spec([0, 0, 0]));
    expect(zeros.marks).toEqual([]);
    expect(texts(zeros.labels, 'name|')).toHaveLength(3);
    expect(texts(zeros.labels, 'value|')).toEqual(['0', '0', '0']);
    expect(zeros.stages.every((s) => Number.isNaN(s.ofFirst))).toBe(true);
    const missing = buildFunnelModel(spec([100, Number.NaN, 20]));
    expect(bars(missing.marks)).toHaveLength(2);
    expect(texts(missing.labels, 'value|')[1]).toBe('—');
    expect(Number.isNaN(missing.stages[1]!.dropOff)).toBe(true);
    // Negative values draw as zero but keep their value.
    const negative = buildFunnelModel(spec([100, -5]));
    expect(bars(negative.marks)).toHaveLength(1);
    expect(negative.stages[1]!.value).toBe(-5);
  });

  it('truncates very long stage names to the label gutter', () => {
    const long = 'A remarkably long onboarding stage name that keeps on going';
    const m = buildFunnelModel(spec([10, 5], { names: [long, 'Short'] }));
    const name = m.labels.find((l) => l.key === `name|${long}`)!;
    expect(name.text.endsWith('…')).toBe(true);
    expect(estimateTextWidth(name.text, 11)).toBeLessThanOrEqual(600 * 0.32);
    // The bar area starts right of the gutter.
    expect(bars(m.marks)[0]!.x).toBeGreaterThan(name.x);
  });

  it('thins labels and hides drop-offs when stages are packed tightly', () => {
    const values = Array.from({ length: 40 }, (_, i) => 1000 - i * 20);
    const m = buildFunnelModel(spec(values, { height: 240 }));
    expect(bars(m.marks)).toHaveLength(40);
    expect(texts(m.labels, 'drop|')).toEqual([]);
    const names = texts(m.labels, 'name|');
    expect(names.length).toBeGreaterThan(5);
    expect(names.length).toBeLessThan(40);
    expect(overlaps(m.labels)).toEqual([]);
  });

  it('places labels without overlaps in every layout', () => {
    const values = [12400, 8300, 4100, 1900, 640];
    const names = ['Visited site', 'Signed up', 'Activated', 'Subscribed', 'Renewed'];
    for (const variant of ['bars', 'trapezoid'] as const)
      for (const orientation of ['vertical', 'horizontal'] as const)
        for (const width of [320, 720]) {
          const m = buildFunnelModel({
            width,
            height: 300,
            values: Float64Array.from(values),
            names,
            variant,
            orientation,
          });
          expect(overlaps(m.labels), `${variant}/${orientation}/${width}`).toEqual([]);
          for (const l of m.labels) {
            const b = box(l);
            expect(b.x0, `${l.text} ${variant}/${orientation}/${width}`).toBeGreaterThanOrEqual(-1);
            expect(b.x1, `${l.text} ${variant}/${orientation}/${width}`).toBeLessThanOrEqual(
              width + 1,
            );
          }
        }
  });

  it('puts value labels inside bars with readable ink, or beside narrow bars', () => {
    const m = buildFunnelModel(spec([1000, 20], { width: 700 }));
    const [wide, narrow] = m.labels.filter((l) => l.key.startsWith('value|'));
    const [b0, b1] = bars(m.marks);
    expect(wide!.fill).toBe('var(--jc-on-fill)');
    expect(wide!.x).toBeCloseTo(b0!.x + b0!.width / 2);
    expect(narrow!.fill).toBeUndefined();
    expect(narrow!.anchor).toBe('start');
    expect(narrow!.x).toBeGreaterThan(b1!.x + b1!.width);
    // Explicit colours pick black or white ink by contrast.
    const dark = buildFunnelModel(spec([10], { colors: '#1e293b' }));
    expect(dark.labels.find((l) => l.key.startsWith('value|'))!.fill).toBe('#ffffff');
  });
});

describe('funnel model: interaction', () => {
  it('hit tests whole stage bands, including the gap halves', () => {
    const m = buildFunnelModel(spec([1000, 600, 300]));
    const [a, b] = bars(m.marks);
    expect(m.hitTest(5, a!.y + a!.height / 2)).toBe(0); // on the name gutter
    const gapTop = a!.y + a!.height;
    const gapBottom = b!.y;
    expect(m.hitTest(300, gapTop + (gapBottom - gapTop) * 0.25)).toBe(0);
    expect(m.hitTest(300, gapTop + (gapBottom - gapTop) * 0.75)).toBe(1);
    expect(m.hitTest(300, 299)).toBe(2);
    expect(m.hitTest(300, -20)).toBe(-1);
    expect(m.hitTest(-5, 100)).toBe(-1);
  });

  it('anchors tooltips at the value end and emphasises the active stage', () => {
    const m = buildFunnelModel(spec([1000, 500]));
    const [, b] = bars(m.marks);
    expect(m.anchor(1)).toEqual({ x: b!.x + b!.width, y: b!.y + b!.height / 2 });
    const active = m.activeMark(1) as RectMark;
    expect(active.key).toBe('active|Stage 2');
    expect(active.width).toBeCloseTo(b!.width);
    expect(m.activeMark(9)).toBeNull();
    expect(buildFunnelModel(spec([0, 0])).activeMark(0)).toBeNull();
    const t = buildFunnelModel(spec([10, 5], { variant: 'trapezoid' }));
    expect(t.activeMark(0)?.type).toBe('polygon');
  });

  it('animates bars from the centre line', () => {
    const m = buildFunnelModel(spec([10, 5]));
    const r = bars(m.marks)[0]!;
    expect(r.enter?.width).toBe(0);
    expect(r.enter?.x).toBeCloseTo(r.x + r.width / 2);
    expect(f(1).length).toBe(1);
  });
});

describe('funnel model: layout refinements', () => {
  it('caps vertical bar thickness and centres a short funnel', () => {
    const one = buildFunnelModel(spec([320], { height: 300 }));
    const bar = bars(one.marks)[0]!;
    expect(bar.height).toBe(64);
    expect(bar.y + bar.height / 2).toBeCloseTo(150);
    // Horizontal columns keep filling the width.
    const h = buildFunnelModel(spec([10, 5], { orientation: 'horizontal' }));
    expect(bars(h.marks)[0]!.width).toBeGreaterThan(64);
  });

  it('draws no connectors into or out of a missing stage', () => {
    const m = buildFunnelModel(spec([100, Number.NaN, 40]));
    expect(links(m.marks)).toHaveLength(0);
    const t = buildFunnelModel(spec([100, Number.NaN, 40], { variant: 'trapezoid' }));
    const segs = t.marks.filter((x): x is PolygonMark => x.type === 'polygon');
    expect(segs).toHaveLength(2);
    // The segment before the gap stays straight instead of collapsing to a point.
    expect(segs[0]!.xs[2]! - segs[0]!.xs[3]!).toBeCloseTo(segs[0]!.xs[1]! - segs[0]!.xs[0]!);
  });

  it('skips drop-off labels between zero stages but keeps real zero losses', () => {
    expect(texts(buildFunnelModel(spec([0, 0, 0])).labels, 'drop|')).toEqual([]);
    expect(texts(buildFunnelModel(spec([50, 50])).labels, 'drop|')).toEqual(['0% / 0']);
    expect(texts(buildFunnelModel(spec([50, 0])).labels, 'drop|')).toEqual(['−100% / −50']);
  });

  it('keeps semibold labels inside bars only when they really fit', () => {
    const m = buildFunnelModel(spec([1000, 600], { width: 360 }));
    for (const l of m.labels.filter((x) => x.fill)) {
      const stage = m.stages.find((s) => l.key.startsWith(`value|${s.key}|`))!;
      expect(estimateTextWidth(l.text, 11) * 1.1 + 16).toBeLessThanOrEqual(stage.width);
    }
  });
});
