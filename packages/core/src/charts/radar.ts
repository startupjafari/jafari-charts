import { createTickFormat } from '../formatting/number';
import { estimateTextWidth, truncateText } from '../formatting/text';
import { polarToCartesian, type SymbolShape } from '../geometry/shapes';
import { pointAngle, TAU } from '../layout/polar';
import { linearTicks, niceDomain } from '../scales/ticks';
import type {
  ArcMark,
  LineMark,
  Mark,
  PolygonMark,
  RuleMark,
  SymbolMark,
  TextMark,
} from '../scene/marks';

// ---------------------------------------------------------------------------------------------
// Radar (spider) chart
// ---------------------------------------------------------------------------------------------

/** One dataset: a polygon with a value on every spoke. */
export interface RadarSeriesSpec {
  id: string;
  label: string;
  /** Any CSS colour, including `var(--jc-series-1)`. */
  color: string;
  /** One value per metric (spoke); NaN marks a missing value. */
  values: Float64Array;
  visible?: boolean;
  symbol?: SymbolShape;
  /** SVG dash array for the outline (differentiate mode). */
  dash?: string;
}

export interface RadarSpec {
  width: number;
  height: number;
  /** Metric names, one per spoke, clockwise from `startAngle`. */
  metrics: readonly string[];
  series: readonly RadarSeriesSpec[];
  /** Value at the centre. Default 0, or a nice minimum when data is negative. */
  min?: number;
  /** Value at the outer ring. Default: a nice maximum of the visible data. */
  max?: number;
  /** Number of grid rings. Default: nice tick values (usually 4–5 rings). */
  levels?: number;
  /** Grid ring shape. Fewer than three metrics always use circles. */
  shape?: 'polygon' | 'circle';
  /** Angle of the first spoke in radians, clockwise from 12 o'clock (default 0). */
  startAngle?: number;
  /** Fill opacity of the dataset polygons (default 0.14). */
  fillOpacity?: number;
  /** Markers on every vertex (default true). */
  dots?: boolean;
  dotSize?: number;
  /** Tick labels along the first spoke (default true). */
  ticks?: boolean;
  /** Formats tick labels. */
  format?: (value: number) => string;
  /** Space around the chart, px (default 8). */
  padding?: number;
  fontSize?: number;
  locale?: string;
}

export interface RadarRing {
  value: number;
  radius: number;
}

export interface RadarModel {
  cx: number;
  cy: number;
  /** Radius of the outer ring. */
  radius: number;
  /** Value domain `[centre, outer ring]`. */
  domain: [number, number];
  rings: RadarRing[];
  /** Chart angle of every spoke. */
  angles: Float64Array;
  /** Grid geometry (rings and spokes) as marks for the background layer. */
  grid: Mark[];
  /** Dataset fills, outlines and markers. */
  marks: Mark[];
  /** Metric labels at the spoke ends (truncated to fit). */
  labels: TextMark[];
  /** Tick labels along the first spoke. */
  tickLabels: TextMark[];
  /** Radius of a value (clamped to the domain). */
  radiusOf(value: number): number;
  /** Pixel position of a series value on a spoke, null when missing. */
  point(series: number, metric: number): { x: number; y: number } | null;
  /** End of a spoke (outer ring). */
  spokeEnd(metric: number): { x: number; y: number };
  /** Metric (spoke) whose sector contains the point, or -1. */
  hitTest(x: number, y: number): number;
}

const LABEL_GAP = 10;

interface LabelBox {
  anchor: 'start' | 'middle' | 'end';
  baseline: 'auto' | 'middle' | 'hanging';
}

/** Text anchor and baseline for a label at a chart angle, so it extends away from the centre. */
export function radarLabelPlacement(angle: number): LabelBox {
  const s = Math.sin(angle);
  const c = Math.cos(angle);
  return {
    anchor: Math.abs(s) < 0.2 ? 'middle' : s > 0 ? 'start' : 'end',
    baseline: c > 0.8 ? 'auto' : c < -0.8 ? 'hanging' : 'middle',
  };
}

/**
 * Lays out a radar chart. Metrics are spokes (clockwise from 12 o'clock), datasets are
 * polygons. The radius scale is linear from `min` at the centre to `max` at the outer
 * ring; values outside the domain are clamped. Missing values break the outline (no
 * vertex at that spoke) and the fill covers only the sectors where the outline exists.
 */
export function buildRadarModel(spec: RadarSpec): RadarModel {
  const { width, height, metrics, series } = spec;
  const n = metrics.length;
  const fontSize = spec.fontSize ?? 11;
  const pad = spec.padding ?? 8;
  const startAngle = spec.startAngle ?? 0;
  const step = n > 0 ? TAU / n : TAU;
  const angles = Float64Array.from({ length: n }, (_, i) => startAngle + i * step);
  const visible = (s: RadarSeriesSpec) => s.visible !== false;

  // ---- 1. Value domain ---------------------------------------------------------------------
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  for (const s of series) {
    if (!visible(s)) continue;
    for (let i = 0; i < n; i++) {
      const v = s.values[i] as number;
      if (!Number.isFinite(v)) continue;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  }
  if (!Number.isFinite(lo)) {
    lo = 0;
    hi = 1;
  }
  let d0 = spec.min ?? Math.min(0, lo);
  let d1 = spec.max ?? Math.max(hi, d0);
  if (d1 <= d0) d1 = d0 + (spec.max === undefined ? Math.abs(d0) || 1 : 1);
  const count = spec.levels ?? 4;
  if (spec.min === undefined || spec.max === undefined) {
    const [n0, n1] = niceDomain([d0, d1], count);
    if (spec.min === undefined) d0 = n0;
    if (spec.max === undefined) d1 = n1;
  }
  let ringValues: number[];
  if (spec.levels !== undefined) {
    const k = Math.max(1, Math.round(spec.levels));
    ringValues = Array.from({ length: k }, (_, i) => d0 + ((d1 - d0) * (i + 1)) / k);
  } else {
    ringValues = linearTicks(d0, d1, count).filter((v) => v > d0 + (d1 - d0) * 1e-9);
    const last = ringValues.at(-1);
    if (last === undefined || Math.abs(last - d1) > (d1 - d0) * 1e-9) ringValues.push(d1);
  }
  // Values for tick labels: equal-width steps get a shared precision.
  const tickFormat = spec.format ?? createTickFormat([d0, ...ringValues], spec.locale ?? 'en');

  // ---- 2. Radius and centre (labels must fit) ----------------------------------------------
  const lineHeight = Math.ceil(fontSize * 1.25);
  const maxLabel = Math.max(36, Math.min(160, width * 0.24));
  const placement = Array.from(angles, (a) => radarLabelPlacement(a));
  const rawWidth = metrics.map((m) => estimateTextWidth(m, fontSize));
  const polygonGrid = (spec.shape ?? 'polygon') === 'polygon' && n >= 3;
  const extents = (r: number, widths: readonly number[]) => {
    // Bounding box (relative to the centre) of the grid and every label.
    let x0 = -r;
    let x1 = r;
    let y0 = -r;
    let y1 = r;
    if (polygonGrid) {
      x0 = y0 = Number.POSITIVE_INFINITY;
      x1 = y1 = Number.NEGATIVE_INFINITY;
      for (const a of angles) {
        const p = polarToCartesian(0, 0, r, a);
        x0 = Math.min(x0, p.x);
        x1 = Math.max(x1, p.x);
        y0 = Math.min(y0, p.y);
        y1 = Math.max(y1, p.y);
      }
    }
    for (let i = 0; i < n; i++) {
      const p = polarToCartesian(0, 0, r + LABEL_GAP, angles[i] as number);
      const { anchor, baseline } = placement[i] as LabelBox;
      const w = widths[i] as number;
      const lx = anchor === 'start' ? p.x : anchor === 'end' ? p.x - w : p.x - w / 2;
      const ly =
        baseline === 'auto'
          ? p.y - lineHeight
          : baseline === 'hanging'
            ? p.y
            : p.y - lineHeight / 2;
      x0 = Math.min(x0, lx);
      x1 = Math.max(x1, lx + w);
      y0 = Math.min(y0, ly);
      y1 = Math.max(y1, ly + lineHeight);
    }
    return { x0, x1, y0, y1 };
  };
  const availW = Math.max(0, width - pad * 2);
  const availH = Math.max(0, height - pad * 2);
  const fits = (r: number, widths: readonly number[]) => {
    const e = extents(r, widths);
    return e.x1 - e.x0 <= availW && e.y1 - e.y0 <= availH;
  };
  let widths = rawWidth.map((w) => Math.min(w, maxLabel));
  const base = Math.max(0, Math.min(availW, availH) / 2);
  let r0 = 0;
  let r1 = base;
  for (let k = 0; k < 24; k++) {
    const mid = (r0 + r1) / 2;
    if (fits(mid, widths)) r0 = mid;
    else r1 = mid;
  }
  let radius = r0;
  // Long labels never shrink the chart below 55% of the available size: they are truncated.
  const floor = base * 0.55;
  if (radius < floor && n > 0) {
    radius = floor;
    widths = widths.map((w, i) => {
      const { anchor } = placement[i] as LabelBox;
      const p = polarToCartesian(0, 0, radius + LABEL_GAP, angles[i] as number);
      // Side labels get what is left between the spoke end and the edge; top and bottom
      // labels (centred) are limited to half the width.
      const room = anchor === 'middle' ? availW / 2 : availW / 2 - Math.abs(p.x);
      return Math.max(0, Math.min(w, room));
    });
    // Vertical overflow (very short charts): shrink until the box fits.
    while (radius > 4 && !fits(radius, widths)) radius *= 0.95;
  }
  const box = extents(radius, widths);
  const cx = pad + (availW - (box.x1 - box.x0)) / 2 - box.x0;
  const cy = pad + (availH - (box.y1 - box.y0)) / 2 - box.y0;
  const span = d1 - d0;
  const radiusOf = (v: number): number => radius * Math.min(1, Math.max(0, (v - d0) / (span || 1)));

  // ---- 3. Grid -----------------------------------------------------------------------------
  const grid: Mark[] = [];
  const rings: RadarRing[] = ringValues.map((value) => ({ value, radius: radiusOf(value) }));
  const ringMark = (r: number, key: string, stroke: string): Mark => {
    if (polygonGrid) {
      const xs = new Float64Array(n + 1);
      const ys = new Float64Array(n + 1);
      for (let i = 0; i <= n; i++) {
        const p = polarToCartesian(cx, cy, r, angles[i % n] as number);
        xs[i] = p.x;
        ys[i] = p.y;
      }
      const line: LineMark = {
        type: 'line',
        key,
        xs,
        ys,
        curve: 'linear',
        stroke,
        strokeWidth: 1,
        series: -1,
      };
      return line;
    }
    const arc: ArcMark = {
      type: 'arc',
      key,
      cx,
      cy,
      innerRadius: Math.max(0, r - 0.5),
      outerRadius: r + 0.5,
      startAngle: 0,
      endAngle: TAU,
      fill: stroke,
      series: -1,
    };
    return arc;
  };
  if (radius > 0) {
    for (const ring of rings)
      grid.push(ringMark(ring.radius, `ring|${ring.value}`, 'var(--jc-grid)'));
    // Emphasise zero when the centre is negative.
    if (d0 < 0 && d1 > 0) grid.push(ringMark(radiusOf(0), 'ring|zero', 'var(--jc-axis)'));
    for (let i = 0; i < n; i++) {
      const p = polarToCartesian(cx, cy, radius, angles[i] as number);
      const spoke: RuleMark = {
        type: 'rule',
        key: `spoke|${i}`,
        x1: cx,
        y1: cy,
        x2: p.x,
        y2: p.y,
        stroke: 'var(--jc-grid)',
        strokeWidth: 1,
        series: -1,
      };
      grid.push(spoke);
    }
  }

  // ---- 4. Labels ---------------------------------------------------------------------------
  const labels: TextMark[] = [];
  for (let i = 0; i < n; i++) {
    const a = angles[i] as number;
    const p = polarToCartesian(cx, cy, radius + LABEL_GAP, a);
    const { anchor, baseline } = placement[i] as LabelBox;
    const text = truncateText(metrics[i] as string, widths[i] as number, fontSize);
    if (!text) continue;
    labels.push({ key: `metric|${i}`, x: p.x, y: p.y, text, anchor, baseline });
  }
  const tickLabels: TextMark[] = [];
  if (spec.ticks !== false && radius > 0) {
    const a = angles[0] ?? startAngle;
    let lastY = Number.POSITIVE_INFINITY;
    const ticks = d0 < 0 ? [{ value: d0, radius: 0 }, ...rings] : rings;
    for (const t of ticks) {
      const p = polarToCartesian(cx, cy, t.radius, a);
      // Skip labels that would collide with the previous one.
      if (Math.abs(lastY - p.y) < lineHeight && Math.abs(Math.cos(a)) > 0.5) continue;
      lastY = p.y;
      tickLabels.push({
        key: `tick|${t.value}`,
        x: p.x + 4,
        y: p.y,
        text: tickFormat(t.value),
        anchor: 'start',
        baseline: 'middle',
      });
    }
  }

  // ---- 5. Datasets -------------------------------------------------------------------------
  const marks: Mark[] = [];
  const coords = series.map((s) => {
    const xs = new Float64Array(n);
    const ys = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const v = s.values[i] as number;
      if (!Number.isFinite(v)) {
        xs[i] = Number.NaN;
        ys[i] = Number.NaN;
        continue;
      }
      const p = polarToCartesian(cx, cy, radiusOf(v), angles[i] as number);
      xs[i] = p.x;
      ys[i] = p.y;
    }
    return { xs, ys };
  });
  const fillOpacity = spec.fillOpacity ?? 0.14;
  const dots = spec.dots ?? true;
  const dotSize = spec.dotSize ?? 7;
  // All fills first, then outlines, then markers: outlines stay crisp over other fills.
  const layers: Mark[][] = [[], [], []];
  series.forEach((s, si) => {
    if (!visible(s) || n === 0) return;
    const { xs, ys } = coords[si] as { xs: Float64Array; ys: Float64Array };
    const defined: number[] = [];
    for (let i = 0; i < n; i++) if (Number.isFinite(xs[i] as number)) defined.push(i);
    if (!defined.length) return;
    const fillMark = (key: string, px: number[], py: number[]): PolygonMark => ({
      type: 'polygon',
      key,
      xs: Float64Array.from(px),
      ys: Float64Array.from(py),
      closed: true,
      fill: s.color,
      fillOpacity,
      series: si,
      enter: { opacity: 0 },
    });
    if (n >= 3 && defined.length === n) {
      (layers[0] as Mark[]).push(fillMark(`${s.id}|fill`, Array.from(xs), Array.from(ys)));
    } else if (n >= 3 && defined.length >= 2) {
      // Gaps: fill only where the outline exists — one fan from the centre per run of
      // consecutive values — so a missing value never reads as a chord across the chart.
      const firstGap = Array.from({ length: n }, (_, i) => i).find(
        (i) => !Number.isFinite(xs[i] as number),
      ) as number;
      let run: number[] = [];
      const flush = () => {
        if (run.length >= 2)
          (layers[0] as Mark[]).push(
            fillMark(
              `${s.id}|fill|${run[0]}`,
              [cx, ...run.map((i) => xs[i] as number)],
              [cy, ...run.map((i) => ys[i] as number)],
            ),
          );
        run = [];
      };
      for (let k = 1; k <= n; k++) {
        const i = (firstGap + k) % n;
        if (Number.isFinite(xs[i] as number)) run.push(i);
        else flush();
      }
      flush();
    }
    // Outline: a closed polyline; missing values split it (gaps), two metrics give a segment.
    const closing = n >= 3 ? 1 : 0;
    const lx = new Float64Array(n + closing);
    const ly = new Float64Array(n + closing);
    for (let i = 0; i < n + closing; i++) {
      lx[i] = xs[i % n] as number;
      ly[i] = ys[i % n] as number;
    }
    if (defined.length > 1) {
      const outline: LineMark = {
        type: 'line',
        key: `${s.id}|outline`,
        xs: lx,
        ys: ly,
        curve: 'linear',
        stroke: s.color,
        strokeWidth: 2,
        ...(s.dash ? { dash: s.dash } : {}),
        series: si,
        enter: { opacity: 0 },
      };
      (layers[1] as Mark[]).push(outline);
    }
    // Markers on every vertex (always for isolated vertices, which have no outline).
    const markerIdx = dots
      ? defined
      : defined.filter((i) => {
          const prev = (i - 1 + n) % n;
          const next = (i + 1) % n;
          return !Number.isFinite(xs[prev] as number) && !Number.isFinite(xs[next] as number);
        });
    if (markerIdx.length || defined.length === 1) {
      const idx = defined.length === 1 ? defined : markerIdx;
      const sym: SymbolMark = {
        type: 'symbol',
        key: `${s.id}|dots`,
        xs: Float64Array.from(idx, (i) => xs[i] as number),
        ys: Float64Array.from(idx, (i) => ys[i] as number),
        indices: Uint32Array.from(idx),
        size: dotSize,
        shape: s.symbol ?? 'circle',
        fill: s.color,
        stroke: 'var(--jc-bg)',
        strokeWidth: 4,
        series: si,
        enter: { size: 0 },
      };
      (layers[2] as Mark[]).push(sym);
    }
  });
  for (const layer of layers) marks.push(...layer);

  // ---- 6. Queries --------------------------------------------------------------------------
  const reach = radius + LABEL_GAP + lineHeight * 1.5;
  return {
    cx,
    cy,
    radius,
    domain: [d0, d1],
    rings,
    angles,
    grid,
    marks,
    labels,
    tickLabels,
    radiusOf,
    point(si, i) {
      const c = coords[si];
      if (!c || i < 0 || i >= n || !visible(series[si] as RadarSeriesSpec)) return null;
      const x = c.xs[i] as number;
      const y = c.ys[i] as number;
      return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
    },
    spokeEnd: (i) => polarToCartesian(cx, cy, radius, angles[i] ?? startAngle),
    hitTest(x, y) {
      if (n === 0) return -1;
      const r = Math.hypot(x - cx, y - cy);
      if (r > reach) return -1;
      if (n === 1) return 0;
      const a = pointAngle(x, y, cx, cy);
      const rel = (((a - startAngle) % TAU) + TAU) % TAU;
      return Math.round(rel / step) % n;
    },
  };
}
