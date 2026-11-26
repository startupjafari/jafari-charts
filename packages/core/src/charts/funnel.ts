import { onFillColor } from '../color/color';
import { formatAuto, formatPercent } from '../formatting/number';
import { estimateTextWidth, truncateText } from '../formatting/text';
import type { Mark, PolygonMark, RectMark, TextMark } from '../scene/marks';

// ---------------------------------------------------------------------------------------------
// Funnel: conversion through ordered stages
// ---------------------------------------------------------------------------------------------

export type FunnelVariant = 'bars' | 'trapezoid';
/** What stage percentages are relative to: the first stage or the previous one. */
export type FunnelPercentBase = 'first' | 'previous';

export interface FunnelSpec {
  width: number;
  height: number;
  /** One value per stage, in funnel order. NaN = missing; negatives draw as zero. */
  values: Float64Array;
  /** Stage names (labels and accessibility). */
  names: readonly string[];
  /** Stable keys per stage (transitions); defaults to the names. */
  keys?: readonly string[];
  /** One colour for every stage, or one per stage (default `var(--jc-series-1)`). */
  colors?: string | readonly string[];
  /** `bars`: centred bars with soft connectors; `trapezoid`: one continuous funnel shape. */
  variant?: FunnelVariant;
  /** `vertical`: stages top → bottom; `horizontal`: stages left → right. */
  orientation?: 'vertical' | 'horizontal';
  percentBase?: FunnelPercentBase;
  /** Stage names and value labels (default true). */
  labels?: boolean;
  /** Loss labels between stages, when there is room (default true). */
  dropOff?: boolean;
  /** Opacity of the connectors between bars (default 0.2). */
  connectorOpacity?: number;
  cornerRadius?: number;
  fontSize?: number;
  padding?: number;
  locale?: string;
  formatValue?: (value: number) => string;
  /** Formats a ratio (0.25 → "25%"). */
  formatPercent?: (ratio: number) => string;
}

export interface FunnelStage {
  index: number;
  key: string;
  name: string;
  /** Raw value (NaN when missing). */
  value: number;
  /** Ratio to the first stage (NaN when the first stage is not positive). */
  ofFirst: number;
  /** Ratio to the previous stage (NaN for the first stage or a non-positive previous one). */
  ofPrevious: number;
  /** `ofFirst` or `ofPrevious`, following `percentBase`. */
  percent: number;
  /** Loss from the previous stage: positive = drop, negative = growth (NaN for the first stage). */
  dropOff: number;
  /** `dropOff` relative to the previous stage (NaN when undefined). */
  dropOffRate: number;
  /** Bounding box of the stage shape, px. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Length of the value edge (bar width, or column height when horizontal), px. */
  size: number;
}

export interface FunnelModel {
  orientation: 'vertical' | 'horizontal';
  variant: FunnelVariant;
  stages: FunnelStage[];
  /** Largest positive value (100 % of the bar length). */
  max: number;
  marks: Mark[];
  labels: TextMark[];
  /** Index of the stage under the point (whole stage band), or -1. */
  hitTest(x: number, y: number): number;
  /** Emphasised copy of a stage shape (drawn above dimmed marks). */
  activeMark(index: number): Mark | null;
  /** Tooltip anchor of a stage (value end of the bar). */
  anchor(index: number): { x: number; y: number };
}

/** Thickest vertical bar, px (few stages in a tall chart stay elegant). */
const MAX_BAR = 64;
const MINUS = '−';

/** Percentages with one decimal below 10 % and whole numbers above ("62%", "4.8%"). */
export function funnelPercent(ratio: number, locale = 'en'): string {
  if (!Number.isFinite(ratio)) return '';
  return formatPercent(ratio, locale, Math.abs(ratio) < 0.1 ? 1 : 0);
}

interface Candidate {
  lines: string[];
  width: number;
}

export function buildFunnelModel(spec: FunnelSpec): FunnelModel {
  const { width: W, height: H } = spec;
  const n = Math.min(spec.values.length, spec.names.length);
  const horizontal = spec.orientation === 'horizontal';
  const variant: FunnelVariant = spec.variant ?? 'bars';
  const percentBase = spec.percentBase ?? 'first';
  const fs = spec.fontSize ?? 11;
  const pad = spec.padding ?? 4;
  const showLabels = spec.labels !== false;
  const showDrop = spec.dropOff !== false;
  const locale = spec.locale ?? 'en';
  const fv = spec.formatValue ?? ((v: number) => formatAuto(v, locale));
  const fp = spec.formatPercent ?? ((r: number) => funnelPercent(r, locale));
  const colorOf = (i: number): string =>
    typeof spec.colors === 'string'
      ? spec.colors
      : (spec.colors?.[i] ?? spec.colors?.[0] ?? 'var(--jc-series-1)');
  const keyOf = (i: number) => spec.keys?.[i] ?? spec.names[i] ?? String(i);
  const radius = spec.cornerRadius ?? 4;
  const linkOpacity = spec.connectorOpacity ?? 0.2;

  // ---- 1. Conversion math ---------------------------------------------------------------------
  const sizes = new Float64Array(n);
  let max = 0;
  for (let i = 0; i < n; i++) {
    const v = spec.values[i] as number;
    sizes[i] = Number.isFinite(v) && v > 0 ? v : 0;
    max = Math.max(max, sizes[i] as number);
  }
  const first = spec.values[0] as number;
  const ratio = (v: number, base: number) =>
    Number.isFinite(v) && Number.isFinite(base) && base > 0 ? v / base : Number.NaN;

  // ---- 2. Frame -------------------------------------------------------------------------------
  // Vertical: a left gutter holds the stage names. Horizontal: a bottom row does.
  let nameSpace = 0;
  if (showLabels && n > 0) {
    if (horizontal) nameSpace = fs + 10;
    else {
      let widest = 0;
      for (let i = 0; i < n; i++)
        widest = Math.max(widest, estimateTextWidth(spec.names[i] ?? '', fs));
      nameSpace = Math.min(widest + 12, W * 0.32, 220);
    }
  }
  const crossStart = horizontal ? pad : pad + nameSpace;
  const crossEnd = horizontal ? H - pad - nameSpace : W - pad;
  let mainStart = pad;
  const mainEnd = horizontal ? W - pad : H - pad;
  const crossLen = Math.max(0, crossEnd - crossStart);
  const mainLen = Math.max(0, mainEnd - mainStart);
  const center = (crossStart + crossEnd) / 2;
  const scale = max > 0 ? crossLen / max : 0;

  // Gap between stages: room for connectors and drop-off labels (bars), a surface gap (trapezoid).
  const step = n > 0 ? mainLen / n : 0;
  const gap =
    n <= 1
      ? 0
      : variant === 'trapezoid'
        ? Math.min(2, step * 0.2)
        : Math.min(horizontal ? 56 : 36, Math.max(Math.min(2, step * 0.2), step * 0.36));
  // Vertical bars stay below a comfortable thickness; the funnel is centred in the extra space.
  const fill = n > 0 ? Math.max(0, (mainLen - gap * (n - 1)) / n) : 0;
  const thickness = horizontal ? fill : Math.min(fill, MAX_BAR);
  const pitch = thickness + gap;
  mainStart += (mainLen - (n * thickness + Math.max(0, n - 1) * gap)) / 2;

  /** Rectangle from main-axis and cross-axis extents. */
  const box = (m0: number, m1: number, c0: number, c1: number) =>
    horizontal
      ? { x: m0, y: c0, width: m1 - m0, height: c1 - c0 }
      : { x: c0, y: m0, width: c1 - c0, height: m1 - m0 };
  const pt = (m: number, c: number) => (horizontal ? { x: m, y: c } : { x: c, y: m });

  const stages: FunnelStage[] = [];
  for (let i = 0; i < n; i++) {
    const value = spec.values[i] as number;
    const prev = i > 0 ? (spec.values[i - 1] as number) : Number.NaN;
    const ofFirst = ratio(value, first);
    const ofPrevious = i > 0 ? ratio(value, prev) : Number.NaN;
    const dropOff =
      i > 0 && Number.isFinite(value) && Number.isFinite(prev) ? prev - value : Number.NaN;
    const size = (sizes[i] as number) * scale;
    const m0 = mainStart + i * pitch;
    const b = box(m0, m0 + thickness, center - size / 2, center + size / 2);
    stages.push({
      index: i,
      key: keyOf(i),
      name: spec.names[i] ?? '',
      value,
      ofFirst,
      ofPrevious,
      percent: percentBase === 'previous' ? (i === 0 ? ofFirst : ofPrevious) : ofFirst,
      dropOff,
      dropOffRate: Number.isFinite(dropOff) ? ratio(dropOff, prev) : Number.NaN,
      ...b,
      size,
    });
  }

  // ---- 3. Marks -------------------------------------------------------------------------------
  const polygon = (
    key: string,
    m0: number,
    m1: number,
    s0: number,
    s1: number,
    extra: Partial<PolygonMark>,
  ): PolygonMark => {
    const a = pt(m0, center - s0 / 2);
    const b = pt(m0, center + s0 / 2);
    const c = pt(m1, center + s1 / 2);
    const d = pt(m1, center - s1 / 2);
    const mid = pt(m0, center);
    const mid1 = pt(m1, center);
    return {
      type: 'polygon',
      key,
      xs: Float64Array.of(a.x, b.x, c.x, d.x),
      ys: Float64Array.of(a.y, b.y, c.y, d.y),
      closed: true,
      series: 0,
      enter: {
        xs: Float64Array.of(mid.x, mid.x, mid1.x, mid1.x),
        ys: Float64Array.of(mid.y, mid.y, mid1.y, mid1.y),
      },
      ...extra,
    };
  };
  const barMark = (s: FunnelStage): RectMark => ({
    type: 'rect',
    key: `stage|${s.key}`,
    x: s.x,
    y: s.y,
    width: s.width,
    height: s.height,
    radius: Math.min(radius, thickness / 2),
    fill: colorOf(s.index),
    series: 0,
    index: s.index,
    enter: horizontal ? { y: center, height: 0 } : { x: center, width: 0 },
  });
  /** Far edge of a trapezoid segment: the next stage, or straight before a missing one. */
  const bottomOf = (s: FunnelStage): number => {
    const next = stages[s.index + 1];
    return next && Number.isFinite(next.value) ? next.size : s.size;
  };
  const segmentMark = (s: FunnelStage): PolygonMark => {
    const m0 = mainStart + s.index * pitch;
    return polygon(`stage|${s.key}`, m0, m0 + thickness, s.size, bottomOf(s), {
      fill: colorOf(s.index),
      index: s.index,
    });
  };

  const marks: Mark[] = [];
  if (variant === 'bars') {
    for (let i = 0; i + 1 < n; i++) {
      const a = stages[i] as FunnelStage;
      const b = stages[i + 1] as FunnelStage;
      // No connector into or out of a missing stage (zero is a real, total loss).
      if ((a.size <= 0 && b.size <= 0) || !Number.isFinite(a.value) || !Number.isFinite(b.value))
        continue;
      const m0 = mainStart + i * pitch + thickness;
      marks.push(
        polygon(`link|${a.key}`, m0, m0 + gap, a.size, b.size, {
          fill: colorOf(i + 1),
          fillOpacity: linkOpacity,
        }),
      );
    }
    for (const s of stages) if (s.size > 0) marks.push(barMark(s));
  } else {
    for (const s of stages)
      if (Number.isFinite(s.value) && (s.size > 0 || bottomOf(s) > 0)) marks.push(segmentMark(s));
  }

  // ---- 4. Labels ------------------------------------------------------------------------------
  const labels: TextMark[] = [];
  const lineHeight = fs + 3;
  const blockHeight = (lines: number) => lines * fs + (lines - 1) * 3;
  // Thin labels when stages are packed tighter than one text line.
  const every = pitch >= fs + 2 ? 1 : Math.max(1, Math.ceil((fs + 2) / Math.max(pitch, 0.01)));

  const valueCandidates = (s: FunnelStage): Candidate[] => {
    const value = Number.isFinite(s.value) ? fv(s.value) : '—';
    const pct = fp(s.percent);
    const out: Candidate[] = [];
    const add = (lines: string[]) => {
      const w = Math.max(...lines.map((l) => estimateTextWidth(l, fs)));
      out.push({ lines, width: w });
    };
    if (pct) {
      add([`${value} · ${pct}`]);
      if (horizontal) add([value, pct]);
      add([pct]);
    } else add([value]);
    return out;
  };

  const pushLines = (
    key: string,
    lines: string[],
    x: number,
    yCenter: number,
    anchor: TextMark['anchor'],
    ink: string | null,
  ) => {
    const top = yCenter - blockHeight(lines.length) / 2 + fs / 2;
    lines.forEach((text, k) => {
      labels.push({
        key: `${key}|${k}`,
        x,
        y: top + k * lineHeight,
        text,
        anchor,
        baseline: 'middle',
        ...(ink ? { fill: ink, fontWeight: k === 0 ? 600 : 500 } : {}),
      });
    });
  };

  // Half-extent of the funnel outline around the boundary before stage `i`, over ±`span` px.
  const edgeNear = (i: number, span: number): number => {
    const cur = (stages[i] as FunnelStage).size;
    const before = stages[i - 1]?.size ?? cur;
    const after = variant === 'trapezoid' ? bottomOf(stages[i] as FunnelStage) : cur;
    const t = thickness > 0 ? Math.min(1, span / thickness) : 1;
    return cur / 2 + Math.max(0, ((before - cur) / 2) * t, ((after - cur) / 2) * t);
  };
  // Horizontal value labels above columns must not reach into the drop-off labels in the gaps.
  const dropInGaps = showDrop && variant === 'bars' && n > 1;

  if (showLabels) {
    for (const s of stages) {
      if (s.index % every !== 0) continue;
      const mid = mainStart + s.index * pitch + thickness / 2;
      // Centred labels of the first/last column must not cross the chart edge.
      const centred = Math.min(pitch - 14, 2 * (mid - 1), 2 * (W - 1 - mid));
      // Stage name.
      const name = truncateText(s.name, horizontal ? centred : nameSpace - 12, fs);
      if (name)
        labels.push({
          key: `name|${s.key}`,
          x: horizontal ? mid : crossStart - 12,
          y: horizontal ? H - pad - nameSpace / 2 + 1 : mid,
          text: name,
          anchor: horizontal ? 'middle' : 'end',
          baseline: 'middle',
          tone: 'primary',
        });

      // Value · percent: inside the shape when it fits, otherwise beside it.
      const nextSize = variant === 'trapezoid' ? bottomOf(s) : s.size;
      const inner = Math.min(s.size, nextSize);
      const outerEdge = Math.max(s.size, nextSize) / 2;
      const ink = onFillColor(colorOf(s.index));
      const room = horizontal ? (crossLen - s.size) / 2 - 6 : crossEnd - (center + outerEdge) - 8;
      const outsideWidth = horizontal
        ? Math.min(dropInGaps ? thickness + 4 : pitch - 6, centred)
        : room;
      for (const c of valueCandidates(s)) {
        const h = blockHeight(c.lines.length);
        // Labels inside the shape are semibold: allow for the wider glyphs.
        const bold = c.width * 1.1;
        const fitsInside = horizontal
          ? bold + 10 <= Math.min(thickness, centred) && h + 8 <= inner
          : bold + 16 <= inner && h + 4 <= thickness;
        if (fitsInside) {
          const p = pt(mid, center);
          pushLines(`value|${s.key}`, c.lines, p.x, p.y, 'middle', ink);
          break;
        }
        const fitsOutside = horizontal
          ? h + 2 <= room && c.width <= outsideWidth
          : c.width <= outsideWidth && h <= pitch;
        if (fitsOutside) {
          if (horizontal) {
            const y = center - s.size / 2 - 6 - h / 2;
            pushLines(`value|${s.key}`, c.lines, mid, y, 'middle', null);
          } else pushLines(`value|${s.key}`, c.lines, center + outerEdge + 8, mid, 'start', null);
          break;
        }
      }
    }
  }

  // Loss between stages (secondary tone: it is meaningful text, not decoration).
  if (showDrop && n > 1 && every === 1) {
    const dropCandidates = (s: FunnelStage): Candidate[] => {
      // Nothing to say about a step from zero to zero.
      if (!Number.isFinite(s.dropOff) || (s.dropOff === 0 && !Number.isFinite(s.dropOffRate)))
        return [];
      const sign = s.dropOff > 0 ? MINUS : s.dropOff < 0 ? '+' : '';
      const rate = Number.isFinite(s.dropOffRate) ? `${sign}${fp(Math.abs(s.dropOffRate))}` : '';
      const count = `${sign}${fv(Math.abs(s.dropOff))}`;
      const out: Candidate[] = [];
      const add = (lines: string[]) =>
        out.push({ lines, width: Math.max(...lines.map((l) => estimateTextWidth(l, fs))) });
      if (rate) {
        add([`${rate} / ${count}`]);
        add([rate, count]);
        add([rate]);
      } else add([count]);
      return out;
    };
    for (let i = 1; i < n; i++) {
      const s = stages[i] as FunnelStage;
      const boundary = mainStart + i * pitch - gap / 2;
      for (const c of dropCandidates(s)) {
        const h = blockHeight(c.lines.length);
        if (variant === 'bars') {
          // Centred in the connector gap.
          const fits = horizontal ? c.width + 6 <= gap : h + 4 <= gap && c.width <= crossLen;
          if (!fits) continue;
          const p = pt(boundary, center);
          pushLines(`drop|${s.key}`, c.lines, p.x, p.y, 'middle', null);
          break;
        }
        // Trapezoid: beside the outline where the two segments meet (values sit on the other
        // side horizontally, or half a stage away vertically).
        if (horizontal) {
          const top = center + edgeNear(i, c.width / 2 + 2) + 6;
          if (c.width + 4 > pitch || top + h > crossEnd) continue;
          pushLines(`drop|${s.key}`, c.lines, boundary, top + h / 2, 'middle', null);
          break;
        }
        const x = center + edgeNear(i, h / 2 + 2) + 8;
        if (x + c.width > crossEnd || h + fs + 4 > pitch) continue;
        pushLines(`drop|${s.key}`, c.lines, x, boundary, 'start', null);
        break;
      }
    }
  }

  return {
    orientation: horizontal ? 'horizontal' : 'vertical',
    variant,
    stages,
    max,
    marks,
    labels,
    hitTest(x, y) {
      if (!n) return -1;
      const m = horizontal ? x : y;
      const c = horizontal ? y : x;
      if (m < 0 || m > (horizontal ? W : H)) return -1;
      if (horizontal ? c < 0 || c > H : c < 0 || c > W) return -1;
      const i = Math.floor((m - mainStart + gap / 2) / Math.max(pitch, 1e-9));
      return Math.max(0, Math.min(n - 1, i));
    },
    activeMark(i) {
      const s = stages[i];
      if (!s) return null;
      if (variant === 'bars') {
        if (s.size <= 0) return null;
        const m = barMark(s);
        return { ...m, key: `active|${s.key}`, enter: undefined } as RectMark;
      }
      if (!Number.isFinite(s.value) || (s.size <= 0 && bottomOf(s) <= 0)) return null;
      return { ...segmentMark(s), key: `active|${s.key}`, enter: undefined } as PolygonMark;
    },
    anchor(i) {
      const s = stages[i];
      if (!s) return { x: W / 2, y: H / 2 };
      const mid = mainStart + i * pitch + thickness / 2;
      return pt(mid, horizontal ? center - s.size / 2 : center + s.size / 2);
    },
  };
}
