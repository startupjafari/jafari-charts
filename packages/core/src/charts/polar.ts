import { onFillColor } from '../color/color';
import { estimateTextWidth } from '../formatting/text';
import { polarToCartesian } from '../geometry/shapes';
import {
  computePolarFrame,
  hitTestSlices,
  pieLayout,
  pointAngle,
  TAU,
  type PieSlice,
} from '../layout/polar';
import type { ArcMark, Mark, PolygonMark, RuleMark, TextMark } from '../scene/marks';

// ---------------------------------------------------------------------------------------------
// Pie & donut
// ---------------------------------------------------------------------------------------------

export interface PieSpec {
  width: number;
  height: number;
  values: Float64Array;
  /** Stable keys per value (used for transitions and legend toggling). */
  keys: readonly string[];
  colors: readonly string[];
  /** Hidden entries (legend toggles) get no slice. */
  hidden?: ReadonlySet<string>;
  /** Inner radius as a fraction of the outer radius (0 = pie). */
  innerRadius?: number;
  /** Constant-width gap between slices, px. */
  gap?: number;
  cornerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  sort?: boolean;
  padding?: number;
  /** Slice labels: `inside` (when they fit), `outside` (with leader lines) or none. */
  labels?: 'none' | 'inside' | 'outside';
  /** Formats a slice label from its value and share (0–1). */
  labelFormat?: (value: number, share: number, index: number) => string;
  fontSize?: number;
}

export interface PieModel {
  cx: number;
  cy: number;
  outerRadius: number;
  innerRadius: number;
  slices: PieSlice[];
  total: number;
  marks: Mark[];
  labels: TextMark[];
  /** Index into `slices` under the point, or -1. */
  hitTest(x: number, y: number): number;
  /** Mark for a slice, pushed outwards for emphasis. */
  activeMark(slice: number, offset?: number): ArcMark | null;
  /** Label anchor (centroid) of a slice. */
  anchor(slice: number): { x: number; y: number };
}

const LABEL_SPACE = 64;

export function buildPieModel(spec: PieSpec): PieModel {
  const { width, height, keys, colors } = spec;
  const fontSize = spec.fontSize ?? 11;
  const labelMode = spec.labels ?? 'none';
  const hidden = spec.hidden ?? new Set<string>();
  const values = Float64Array.from(spec.values, (v, i) =>
    hidden.has(keys[i] as string) ? Number.NaN : v,
  );
  const startAngle = spec.startAngle ?? 0;
  const endAngle = spec.endAngle ?? TAU;
  const outsidePad = labelMode === 'outside' ? Math.min(LABEL_SPACE, width * 0.18) : 0;
  const frame = computePolarFrame(width - outsidePad * 2, height - (outsidePad ? 24 : 0), {
    padding: spec.padding ?? 6,
    startAngle,
    endAngle,
  });
  const cx = frame.cx + outsidePad;
  const cy = frame.cy + (outsidePad ? 12 : 0);
  const outerRadius = Math.max(0, frame.radius);
  const innerRadius = outerRadius * Math.min(0.95, Math.max(0, spec.innerRadius ?? 0));
  const slices = pieLayout(values, { startAngle, endAngle, sort: spec.sort ?? false });
  let total = 0;
  for (const v of values) if (Number.isFinite(v) && v > 0) total += v;
  const gap = slices.length > 1 ? (spec.gap ?? 2) : 0;
  const corner = spec.cornerRadius ?? (innerRadius > 0 ? 4 : 2);

  const arc = (s: PieSlice, extra = 0): ArcMark => ({
    type: 'arc',
    key: keys[s.index] as string,
    cx,
    cy,
    innerRadius,
    outerRadius: outerRadius + extra,
    startAngle: s.startAngle,
    endAngle: s.endAngle,
    cornerRadius: corner,
    padding: gap,
    fill: colors[s.index] as string,
    series: s.index,
    index: s.index,
    enter: { startAngle, endAngle: startAngle },
  });
  const marks: Mark[] = slices.map((s) => arc(s));

  const fmt = spec.labelFormat ?? ((_v: number, share: number) => `${Math.round(share * 100)}%`);
  const labels: TextMark[] = [];
  const mid = (s: PieSlice) => (s.startAngle + s.endAngle) / 2;
  if (labelMode === 'inside') {
    const r = innerRadius > 0 ? (innerRadius + outerRadius) / 2 : outerRadius * 0.62;
    for (const s of slices) {
      const text = fmt(s.value, s.share, s.index);
      const p = polarToCartesian(cx, cy, r, mid(s));
      const arcLength = (s.endAngle - s.startAngle) * r;
      const thickness = outerRadius - innerRadius;
      if (
        estimateTextWidth(text, fontSize) + 8 > Math.min(arcLength, thickness * 2.2) ||
        fontSize + 6 > thickness
      )
        continue;
      labels.push({
        key: `lbl|${keys[s.index]}`,
        x: p.x,
        y: p.y,
        text,
        anchor: 'middle',
        baseline: 'middle',
        fill: onFillColor(colors[s.index] as string),
        fontWeight: 600,
      });
    }
  } else if (labelMode === 'outside' && slices.length) {
    // Leader lines out of each slice; labels on the same side are pushed apart vertically.
    const sides: Record<'l' | 'r', Array<{ s: PieSlice; y: number; ex: number; ey: number }>> = {
      l: [],
      r: [],
    };
    for (const s of slices) {
      const a = mid(s);
      const e = polarToCartesian(cx, cy, outerRadius + 4, a);
      const k = polarToCartesian(cx, cy, outerRadius + 14, a);
      (Math.sin(a) >= 0 ? sides.r : sides.l).push({ s, y: k.y, ex: e.x, ey: e.y });
    }
    const lineHeight = fontSize + 4;
    for (const side of ['l', 'r'] as const) {
      const items = sides[side].sort((p, q) => p.y - q.y);
      for (let i = 1; i < items.length; i++) {
        const prev = items[i - 1] as (typeof items)[number];
        const cur = items[i] as (typeof items)[number];
        if (cur.y - prev.y < lineHeight) cur.y = prev.y + lineHeight;
      }
      const overflow = (items.at(-1)?.y ?? 0) - (height - fontSize);
      if (overflow > 0) for (const it of items) it.y -= overflow;
      for (const it of items) {
        const x = side === 'r' ? cx + outerRadius + 20 : cx - outerRadius - 20;
        const rule: RuleMark = {
          type: 'rule',
          key: `lead|${keys[it.s.index]}`,
          x1: it.ex,
          y1: it.ey,
          x2: x + (side === 'r' ? -4 : 4),
          y2: it.y,
          stroke: 'var(--jc-text-muted)',
          strokeWidth: 1,
          series: -1,
        };
        marks.push(rule);
        labels.push({
          key: `lbl|${keys[it.s.index]}`,
          x,
          y: it.y,
          text: fmt(it.s.value, it.s.share, it.s.index),
          anchor: side === 'r' ? 'start' : 'end',
          baseline: 'middle',
          tone: 'primary',
        });
      }
    }
  }

  return {
    cx,
    cy,
    outerRadius,
    innerRadius,
    slices,
    total,
    marks,
    labels,
    hitTest: (x, y) =>
      hitTestSlices(slices, x, y, {
        cx,
        cy,
        innerRadius: innerRadius * 0.85,
        outerRadius: outerRadius + 6,
      }),
    activeMark: (i, offset = 4) => {
      const s = slices[i];
      return s
        ? ({ ...arc(s, offset), key: `active|${keys[s.index]}`, enter: undefined } as ArcMark)
        : null;
    },
    anchor(i) {
      const s = slices[i];
      if (!s) return { x: cx, y: cy };
      const r = innerRadius > 0 ? outerRadius : outerRadius * 0.7;
      return polarToCartesian(cx, cy, r, mid(s));
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Radial progress
// ---------------------------------------------------------------------------------------------

export interface RadialProgressSpec {
  width: number;
  height: number;
  /** Progress values; each becomes a ring from the outside in. */
  values: Float64Array;
  /** Maximum per ring (default 100). */
  max: Float64Array;
  keys: readonly string[];
  colors: readonly string[];
  /** Ring thickness, px (default: scales with size). */
  thickness?: number;
  /** Gap between rings, px. */
  gap?: number;
  startAngle?: number;
  endAngle?: number;
  padding?: number;
}

export interface RadialProgressModel {
  cx: number;
  cy: number;
  radius: number;
  innerRadius: number;
  rings: Array<{
    key: string;
    index: number;
    inner: number;
    outer: number;
    fraction: number;
    value: number;
    max: number;
  }>;
  marks: Mark[];
  /** Index of the ring under the point, or -1. */
  hitTest(x: number, y: number): number;
  anchor(ring: number): { x: number; y: number };
}

export function buildRadialProgressModel(spec: RadialProgressSpec): RadialProgressModel {
  const startAngle = spec.startAngle ?? 0;
  const endAngle = spec.endAngle ?? TAU;
  const frame = computePolarFrame(spec.width, spec.height, {
    padding: spec.padding ?? 4,
    startAngle,
    endAngle,
  });
  const n = spec.values.length;
  const radius = frame.radius;
  const gap = spec.gap ?? (n > 1 ? 4 : 0);
  const thickness = Math.max(
    2,
    spec.thickness ??
      Math.min(radius * (n > 1 ? 0.16 : 0.18), (radius * 0.75 - gap * (n - 1)) / Math.max(1, n)),
  );
  const sweep = endAngle - startAngle;
  const marks: Mark[] = [];
  const rings: RadialProgressModel['rings'] = [];
  for (let i = 0; i < n; i++) {
    const outer = radius - i * (thickness + gap);
    const inner = Math.max(0, outer - thickness);
    const value = spec.values[i] as number;
    const max = (spec.max[i] as number) > 0 ? (spec.max[i] as number) : 100;
    const fraction = Number.isFinite(value) ? Math.min(1, Math.max(0, value / max)) : 0;
    const key = spec.keys[i] as string;
    rings.push({ key, index: i, inner, outer, fraction, value, max });
    const base = {
      cx: frame.cx,
      cy: frame.cy,
      innerRadius: inner,
      outerRadius: outer,
      startAngle,
      cornerRadius: thickness / 2,
      series: i,
      index: i,
    };
    marks.push({
      ...base,
      type: 'arc',
      key: `track|${key}`,
      endAngle,
      fill: 'var(--jc-track)',
      series: -1,
    });
    if (fraction > 0) {
      marks.push({
        ...base,
        type: 'arc',
        key: `value|${key}`,
        endAngle: startAngle + sweep * Math.max(fraction, 0.004),
        fill: spec.colors[i] as string,
        enter: { endAngle: startAngle },
      });
    }
  }
  return {
    cx: frame.cx,
    cy: frame.cy,
    radius,
    innerRadius: rings.at(-1)?.inner ?? 0,
    rings,
    marks,
    hitTest(x, y) {
      const r = Math.hypot(x - frame.cx, y - frame.cy);
      for (const ring of rings)
        if (r >= ring.inner - gap / 2 && r <= ring.outer + gap / 2) return ring.index;
      return -1;
    },
    anchor(i) {
      const ring = rings[i];
      if (!ring) return { x: frame.cx, y: frame.cy };
      return polarToCartesian(frame.cx, frame.cy, ring.outer, startAngle + sweep * ring.fraction);
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Gauge
// ---------------------------------------------------------------------------------------------

export interface GaugeBand {
  /** Upper bound of the band (bands are sorted ascending). */
  to: number;
  color: string;
  label?: string;
}

export interface GaugeSpec {
  width: number;
  height: number;
  value: number;
  min?: number;
  max?: number;
  /** Coloured ranges; the value arc takes the colour of the band it falls in. */
  bands?: readonly GaugeBand[];
  /** Arc span: semi (180°), arc (270°) or full circle. */
  variant?: 'semi' | 'arc' | 'full';
  color?: string;
  thickness?: number;
  needle?: boolean;
  padding?: number;
  /** Reserve space under the arc centre for the value text (semi gauges). */
  bottomSpace?: number;
}

export interface GaugeModel {
  cx: number;
  cy: number;
  radius: number;
  innerRadius: number;
  startAngle: number;
  endAngle: number;
  fraction: number;
  /** Colour of the band containing the value (or the base colour). */
  color: string;
  band: GaugeBand | null;
  marks: Mark[];
  hitTest(x: number, y: number): boolean;
}

const GAUGE_SPANS = {
  semi: [-Math.PI / 2, Math.PI / 2],
  arc: [-Math.PI * 0.75, Math.PI * 0.75],
  full: [0, TAU],
} as const;

export function buildGaugeModel(spec: GaugeSpec): GaugeModel {
  const variant = spec.variant ?? 'semi';
  const [startAngle, endAngle] = GAUGE_SPANS[variant];
  const min = spec.min ?? 0;
  const max = spec.max ?? 100;
  const bottom = spec.bottomSpace ?? (variant === 'semi' ? 28 : 0);
  const frame = computePolarFrame(spec.width, spec.height - bottom, {
    padding: spec.padding ?? 6,
    startAngle,
    endAngle,
  });
  const radius = frame.radius;
  const thickness = spec.thickness ?? Math.max(6, radius * 0.16);
  const innerRadius = Math.max(0, radius - thickness);
  const span = endAngle - startAngle;
  const fraction =
    Number.isFinite(spec.value) && max > min
      ? Math.min(1, Math.max(0, (spec.value - min) / (max - min)))
      : 0;
  const bands = [...(spec.bands ?? [])].sort((a, b) => a.to - b.to);
  const band = bands.find((b) => spec.value <= b.to) ?? bands.at(-1) ?? null;
  const color = band?.color ?? spec.color ?? 'var(--jc-series-1)';
  const angleOf = (v: number) =>
    startAngle + span * Math.min(1, Math.max(0, (v - min) / (max - min || 1)));
  const base = {
    cx: frame.cx,
    cy: frame.cy,
    innerRadius,
    outerRadius: radius,
    cornerRadius: Math.min(thickness / 2, 6),
  };
  const marks: Mark[] = [];

  if (bands.length && spec.needle) {
    // Band arcs as the scale, needle shows the value.
    let from = min;
    bands.forEach((b, i) => {
      const a0 = angleOf(from);
      const a1 = angleOf(b.to);
      if (a1 > a0)
        marks.push({
          ...base,
          type: 'arc',
          key: `band|${i}`,
          startAngle: a0,
          endAngle: a1,
          fill: b.color,
          opacity: 0.9,
          padding: 2,
          series: -1,
        });
      from = b.to;
    });
  } else {
    marks.push({
      ...base,
      type: 'arc',
      key: 'track',
      startAngle,
      endAngle,
      fill: 'var(--jc-track)',
      series: -1,
    });
    if (fraction > 0) {
      marks.push({
        ...base,
        type: 'arc',
        key: 'value',
        startAngle,
        endAngle: startAngle + span * fraction,
        fill: color,
        series: 0,
        index: 0,
        enter: { endAngle: startAngle },
      });
    }
    // Threshold ticks at band boundaries.
    bands.slice(0, -1).forEach((b, i) => {
      const a = angleOf(b.to);
      const p0 = polarToCartesian(frame.cx, frame.cy, innerRadius - 3, a);
      const p1 = polarToCartesian(frame.cx, frame.cy, radius + 3, a);
      marks.push({
        type: 'rule',
        key: `tick|${i}`,
        x1: p0.x,
        y1: p0.y,
        x2: p1.x,
        y2: p1.y,
        stroke: 'var(--jc-text-secondary)',
        strokeWidth: 2,
        series: -1,
      });
    });
  }

  if (spec.needle) {
    const a = startAngle + span * fraction;
    const tip = polarToCartesian(frame.cx, frame.cy, radius - thickness * 0.2, a);
    const l = polarToCartesian(frame.cx, frame.cy, thickness * 0.28, a - Math.PI / 2);
    const r = polarToCartesian(frame.cx, frame.cy, thickness * 0.28, a + Math.PI / 2);
    const needle: PolygonMark = {
      type: 'polygon',
      key: 'needle',
      xs: Float64Array.of(l.x, tip.x, r.x),
      ys: Float64Array.of(l.y, tip.y, r.y),
      closed: true,
      fill: 'var(--jc-text)',
      series: 0,
      index: 0,
    };
    marks.push(needle, {
      type: 'symbol',
      key: 'hub',
      xs: Float64Array.of(frame.cx),
      ys: Float64Array.of(frame.cy),
      size: thickness * 0.75,
      shape: 'circle',
      fill: 'var(--jc-text)',
      stroke: 'var(--jc-bg)',
      strokeWidth: 3,
      series: 0,
      index: 0,
    });
  }

  return {
    cx: frame.cx,
    cy: frame.cy,
    radius,
    innerRadius,
    startAngle,
    endAngle,
    fraction,
    color,
    band,
    marks,
    hitTest(x, y) {
      const r = Math.hypot(x - frame.cx, y - frame.cy);
      if (r > radius + 6 || r < (spec.needle ? 0 : innerRadius - 6)) return false;
      if (variant === 'full') return true;
      let a = pointAngle(x, y, frame.cx, frame.cy);
      if (a > Math.PI) a -= TAU;
      return a >= startAngle - 0.1 && a <= endAngle + 0.1;
    },
  };
}
