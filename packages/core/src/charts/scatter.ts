import { KDTree } from '../algorithms/kdtree';
import type { SymbolShape } from '../geometry/shapes';
import {
  computeCartesianFrame,
  resolveValueDomain,
  type AxisSpec,
  type CartesianFrame,
  type ValueDomainOptions,
} from '../layout/cartesian';
import { clampDomain } from '../interaction/zoom';
import type { LinearScale } from '../scales/linear';
import type { LogScale } from '../scales/log';
import type { Mark, SymbolMark, TextMark } from '../scene/marks';
import type { Extent, Margins } from '../types';

// ---------------------------------------------------------------------------------------------
// Scatter & bubble
// ---------------------------------------------------------------------------------------------

/** One group of points (a legend entry): drawn as one batched symbol mark per colour. */
export interface ScatterGroupSpec {
  id: string;
  label: string;
  /** Any CSS colour, including `var(--jc-series-1)`. */
  color: string;
  shape?: SymbolShape;
  /** Data coordinates. Points with a non-finite coordinate are skipped. */
  xs: Float64Array;
  ys: Float64Array;
  /** Bubble size values: the bubble *area* is proportional to the value. */
  sizes?: Float64Array;
  /** Per-point colours (override `color`; points are batched per distinct colour). */
  colors?: readonly (string | undefined)[];
  /** Original datum index of every point (default: its position in `xs`). Must be ascending. */
  indices?: Uint32Array;
  visible?: boolean;
}

export interface ScatterAxisOptions extends ValueDomainOptions {
  scale?: 'linear' | 'log';
  format?: (value: number) => string;
  hidden?: boolean;
  tickCount?: number;
  /**
   * Visible domain (zoom). Used as is (no rounding), clamped to the full domain the data
   * would get without it (`model.bounds`); only points inside are drawn and hit-tested.
   */
  domain?: Extent;
}

export interface ScatterSpec {
  width: number;
  height: number;
  groups: readonly ScatterGroupSpec[];
  x?: ScatterAxisOptions;
  y?: ScatterAxisOptions;
  /**
   * Marker diameter in px without a size encoding. Default: 8 (with a 2px surface
   * ring), stepping down to 6 and 4 for dense data (> 1 000 / > 5 000 points).
   */
  pointSize?: number;
  /** Smallest bubble radius, px (values that would be smaller are clamped up). Default 3. */
  minRadius?: number;
  /** Radius of the largest size value, px. Default: 7% of the shorter side, 10–26px. */
  maxRadius?: number;
  /** Size value drawn at `maxRadius` (default: the largest size in the data). */
  sizeMax?: number;
  /** Fill opacity of the markers (default 1 for points, 0.78 for bubbles). */
  opacity?: number;
  /**
   * Hover target: the nearest point whose centre is within this distance, px (default 24).
   * Bubbles are also hit anywhere inside (and up to 4px outside) their edge.
   */
  hitRadius?: number;
  padding?: Partial<Margins>;
  fontSize?: number;
  locale?: string;
}

/** A drawn point. `flat` indexes the model's flat point arrays. */
export interface ScatterPoint {
  flat: number;
  /** Group index (into `spec.groups`). */
  group: number;
  /** Original datum index. */
  index: number;
  /** Pixel position and marker radius. */
  x: number;
  y: number;
  radius: number;
  /** Data values. */
  xValue: number;
  yValue: number;
  /** Size value, NaN without a size encoding or when missing. */
  size: number;
  color: string;
}

export type ScatterStep = 'next' | 'prev' | 'first' | 'last' | 'up' | 'down';

export interface ScatterModel {
  frame: CartesianFrame;
  marks: Mark[];
  labels: TextMark[];
  /** Number of drawn points (visible groups, finite coordinates). */
  count: number;
  /** Range `[start, end)` of every group in the flat point arrays (empty when hidden). */
  groups: ReadonlyArray<{ start: number; end: number }>;
  /** Pixel coordinates of all drawn points, grouped (group order, then datum order). */
  px: Float64Array;
  py: Float64Array;
  /** Pixel position of zero on each axis when the domain spans zero (for zero lines). */
  zero: { x: number | null; y: number | null };
  /** Bubble scale, null without sizes: radius = max(minRadius, maxRadius·√(value / sizeMax)). */
  bubble: { minRadius: number; maxRadius: number; sizeMax: number } | null;
  /** Full (unzoomed) domain of each axis: the bounds a zoom domain is clamped to. */
  bounds: { x: Extent; y: Extent };
  /** True when an axis `domain` (zoom) narrows the view. */
  zoomed: boolean;
  /** Flat indices of the drawn points whose centre lies in a pixel rectangle. */
  inRect(x0: number, y0: number, x1: number, y1: number): number[];
  point(flat: number): ScatterPoint | null;
  /** Flat index of datum `index` in `group`, or -1. */
  find(group: number, index: number): number;
  /** Nearest point to a pixel position within the hit radius (k-d tree), or -1. */
  hitTest(x: number, y: number): number;
  /** Keyboard navigation: points in x order within a group, up/down switch groups. */
  step(flat: number, direction: ScatterStep): number;
}

const DEFAULT_HIT = 24;
/** Margin around the plot that data marks may draw into before they are clipped. */
const CLIP_MARGIN = 8;

function finiteOn(v: number, log: boolean): boolean {
  return Number.isFinite(v) && (!log || v > 0);
}

/** Widens an extent by `px` pixels on each side, measured on a scale of `length` pixels. */
function padExtent(extent: Extent, px: number, length: number, log: boolean): Extent {
  const [lo, hi] = extent;
  if (!(px > 0) || !(length > 2 * px)) return extent;
  if (log) {
    const l0 = Math.log10(lo);
    const l1 = Math.log10(hi);
    const span = l1 - l0 || 1;
    const pad = (span * px) / (length - 2 * px);
    return [10 ** (l0 - pad), 10 ** (l1 + pad)];
  }
  const span = hi - lo || Math.abs(lo) || 1;
  const pad = (span * px) / (length - 2 * px);
  return [lo - pad, hi + pad];
}

/**
 * Lays out a scatter / bubble chart: both axes continuous (linear or log), one
 * batched symbol mark per group (and colour), and a k-d tree built lazily once
 * per layout for nearest-point hover in pixel space.
 */
export function buildScatterModel(spec: ScatterSpec): ScatterModel {
  const { width, height, groups } = spec;
  const fontSize = spec.fontSize ?? 11;
  const locale = spec.locale ?? 'en';
  const xLog = spec.x?.scale === 'log';
  const yLog = spec.y?.scale === 'log';
  const visible = (g: ScatterGroupSpec) => g.visible !== false;
  const hasSizes = groups.some((g) => g.sizes !== undefined);

  // ---- 1. Data extents ---------------------------------------------------------------------
  let x0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;
  let sizeMax = 0;
  /** Points with finite coordinates (marker density does not change while zooming). */
  let all = 0;
  for (const g of groups) {
    if (!visible(g)) continue;
    const n = Math.min(g.xs.length, g.ys.length);
    for (let i = 0; i < n; i++) {
      const x = g.xs[i] as number;
      const y = g.ys[i] as number;
      if (!finiteOn(x, xLog) || !finiteOn(y, yLog)) continue;
      all++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      const s = g.sizes?.[i] as number;
      if (Number.isFinite(s) && s > sizeMax) sizeMax = s;
    }
  }
  if (spec.sizeMax !== undefined && spec.sizeMax > 0) sizeMax = spec.sizeMax;
  const density = all > 5000 ? 4 : all > 1000 ? 6 : 8;
  const pointSize = Math.max(1, spec.pointSize ?? density);
  const minRadius = Math.max(0.5, spec.minRadius ?? 3);
  const maxRadius = Math.max(
    minRadius,
    spec.maxRadius ?? Math.min(26, Math.max(10, Math.min(width, height) * 0.07)),
  );
  const bubble = hasSizes ? { minRadius, maxRadius, sizeMax } : null;
  const radiusOf = (s: number): number => {
    if (!bubble) return pointSize / 2;
    if (!(s > 0) || !(sizeMax > 0)) return minRadius;
    return Math.max(minRadius, maxRadius * Math.sqrt(Math.min(s, sizeMax) / sizeMax));
  };

  // ---- 2. Domains and frame ----------------------------------------------------------------
  const domainOf = (o: ScatterAxisOptions | undefined, lo: number, hi: number, log: boolean) =>
    resolveValueDomain([lo, hi], {
      includeZero: o?.includeZero ?? 'auto',
      nice: o?.nice ?? true,
      log,
      ...(o?.min !== undefined ? { min: o.min } : {}),
      ...(o?.max !== undefined ? { max: o.max } : {}),
    });
  const axis = (o: ScatterAxisOptions | undefined, domain: Extent, log: boolean): AxisSpec => ({
    kind: log ? 'log' : 'linear',
    domain,
    ...(o?.format ? { format: o.format } : {}),
    ...(o?.hidden ? { hidden: true } : {}),
    ...(o?.tickCount !== undefined ? { tickCount: o.tickCount } : {}),
  });
  const frameFor = (xd: Extent, yd: Extent) =>
    computeCartesianFrame({
      width,
      height,
      x: axis(spec.x, xd, xLog),
      y: axis(spec.y, yd, yLog),
      ...(spec.padding ? { padding: spec.padding } : {}),
      fontSize,
      locale,
    });
  let xDomain = domainOf(spec.x, x0, x1, xLog);
  let yDomain = domainOf(spec.y, y0, y1, yLog);
  let frame = frameFor(xDomain, yDomain);
  // Markers larger than the renderer's 8px clip margin (bubbles, big points) would be cut at
  // the plot edge: widen the data extent by the largest radius (in data units of the first
  // layout) and lay out again. Small markers are never cut, and padding them would cost a
  // whole tick step (scores of 100 on a 0–120 axis). Padding never changes the zero
  // decision and never pushes one-signed data across zero; a single value is already padded
  // by the domain resolver.
  const ring = bubble ? 4 : pointSize >= 6 ? 4 : 2;
  const reach = (bubble ? maxRadius : pointSize / 2) + ring / 2;
  if (all > 0 && reach > CLIP_MARGIN) {
    const pad = reach + 1;
    const autoZero = (lo: number, hi: number) =>
      (lo >= 0 && lo <= hi * 0.25) || (hi <= 0 && hi >= lo * 0.25);
    const padded = (lo: number, hi: number, length: number, log: boolean): Extent => {
      let [a, b] = padExtent([lo, hi], pad, length, log);
      if (!log && lo >= 0 && a < 0) a = 0;
      if (!log && hi <= 0 && b > 0) b = 0;
      return [a, b];
    };
    const fixedX = spec.x?.min !== undefined || spec.x?.max !== undefined;
    const fixedY = spec.y?.min !== undefined || spec.y?.max !== undefined;
    if (!fixedX && x1 > x0) {
      const [a, b] = padded(x0, x1, frame.plot.width, xLog);
      xDomain = domainOf(
        { ...spec.x, includeZero: spec.x?.includeZero ?? autoZero(x0, x1) },
        a,
        b,
        xLog,
      );
    }
    if (!fixedY && y1 > y0) {
      const [a, b] = padded(y0, y1, frame.plot.height, yLog);
      yDomain = domainOf(
        { ...spec.y, includeZero: spec.y?.includeZero ?? autoZero(y0, y1) },
        a,
        b,
        yLog,
      );
    }
    if ((!fixedX && x1 > x0) || (!fixedY && y1 > y0)) frame = frameFor(xDomain, yDomain);
  }
  const bounds = { x: xDomain, y: yDomain };

  // Zoom: the visible domains replace the full ones (clamped to them, in log space on log
  // axes); only points inside are drawn, so hover and keyboard reach visible points only.
  const zoomTo = (d: Extent | undefined, full: Extent, log: boolean): Extent | null => {
    if (!d || !Number.isFinite(d[0]) || !Number.isFinite(d[1]) || d[0] === d[1]) return null;
    if (!log) return clampDomain(d, { bounds: full, minSpan: 0 });
    if (!(d[0] > 0) || !(d[1] > 0)) return null;
    const [a, b] = clampDomain([Math.log10(d[0]), Math.log10(d[1])], {
      bounds: [Math.log10(full[0]), Math.log10(full[1])],
      minSpan: 0,
    });
    return [10 ** a, 10 ** b];
  };
  const zx = zoomTo(spec.x?.domain, xDomain, xLog);
  const zy = zoomTo(spec.y?.domain, yDomain, yLog);
  if (zx || zy) frame = frameFor(zx ?? xDomain, zy ?? yDomain);
  const xs = frame.x as LinearScale | LogScale;
  const ys = frame.y as LinearScale | LogScale;
  const within = (v: number, d: Extent | null) => {
    if (!d) return true;
    const eps = (d[1] - d[0]) * 1e-9;
    return v >= d[0] - eps && v <= d[1] + eps;
  };
  let total = 0;
  if (zx || zy) {
    for (const g of groups) {
      if (!visible(g)) continue;
      const n = Math.min(g.xs.length, g.ys.length);
      for (let i = 0; i < n; i++) {
        const x = g.xs[i] as number;
        const y = g.ys[i] as number;
        if (finiteOn(x, xLog) && finiteOn(y, yLog) && within(x, zx) && within(y, zy)) total++;
      }
    }
  } else total = all;

  // ---- 3. Flat point arrays ----------------------------------------------------------------
  const px = new Float64Array(total);
  const py = new Float64Array(total);
  const radius = new Float64Array(total);
  const gOf = new Uint32Array(total);
  const datum = new Uint32Array(total);
  const xv = new Float64Array(total);
  const yv = new Float64Array(total);
  const sv = new Float64Array(total).fill(Number.NaN);
  const anyColors = groups.some((g) => g.colors !== undefined);
  const flatColors: string[] = anyColors ? new Array<string>(total) : [];
  const ranges: Array<{ start: number; end: number }> = [];
  let f = 0;
  groups.forEach((g, gi) => {
    const start = f;
    if (visible(g)) {
      const n = Math.min(g.xs.length, g.ys.length);
      for (let i = 0; i < n; i++) {
        const x = g.xs[i] as number;
        const y = g.ys[i] as number;
        if (!finiteOn(x, xLog) || !finiteOn(y, yLog) || !within(x, zx) || !within(y, zy)) continue;
        const s = g.sizes ? (g.sizes[i] as number) : Number.NaN;
        px[f] = xs.map(x);
        py[f] = ys.map(y);
        radius[f] = radiusOf(s);
        gOf[f] = gi;
        datum[f] = g.indices ? (g.indices[i] as number) : i;
        xv[f] = x;
        yv[f] = y;
        sv[f] = s;
        if (anyColors) flatColors[f] = g.colors?.[i] ?? g.color;
        f++;
      }
    }
    ranges.push({ start, end: f });
  });

  // ---- 4. Marks ----------------------------------------------------------------------------
  const marks: Mark[] = [];
  const fillOpacity = spec.opacity ?? (bubble ? 0.78 : undefined);
  const colorOf = (flat: number): string =>
    anyColors
      ? (flatColors[flat] as string)
      : (groups[gOf[flat] as number] as ScatterGroupSpec).color;

  groups.forEach((g, gi) => {
    const { start, end } = ranges[gi] as { start: number; end: number };
    if (end <= start) return;
    const shape = g.shape ?? 'circle';
    const base = (key: string, sel: Uint32Array | null, fill: string): SymbolMark => {
      const pick = (a: Float64Array) => {
        if (!sel) return a.subarray(start, end);
        const out = new Float64Array(sel.length);
        for (let k = 0; k < sel.length; k++) out[k] = a[sel[k] as number] as number;
        return out;
      };
      const idx = sel
        ? Uint32Array.from(sel, (k) => datum[k] as number)
        : datum.subarray(start, end);
      let size: number | Float64Array = pointSize;
      if (bubble) {
        const r = pick(radius);
        size = new Float64Array(r.length);
        for (let k = 0; k < r.length; k++) size[k] = (r[k] as number) * 2;
      }
      return {
        type: 'symbol',
        key,
        xs: pick(px),
        ys: pick(py),
        indices: idx,
        size,
        shape,
        fill,
        stroke: 'var(--jc-bg)',
        strokeWidth: ring,
        ...(fillOpacity !== undefined ? { fillOpacity } : {}),
        series: gi,
        enter: bubble ? { opacity: 0 } : { size: 0 },
      };
    };
    if (!g.colors) {
      marks.push(base(`${g.id}|points`, null, g.color));
      return;
    }
    // Per-point colours: one batch per distinct colour, in first-appearance order.
    const byColor = new Map<string, number[]>();
    for (let k = start; k < end; k++) {
      const c = flatColors[k] as string;
      const list = byColor.get(c);
      if (list) list.push(k);
      else byColor.set(c, [k]);
    }
    for (const [c, list] of byColor)
      marks.push(base(`${g.id}|points|${c}`, Uint32Array.from(list), c));
  });

  // ---- 5. Queries --------------------------------------------------------------------------
  let tree: KDTree | null = null;
  const getTree = () => (tree ??= new KDTree(px, py));
  const hitPad = spec.hitRadius ?? DEFAULT_HIT;
  const largest = bubble ? maxRadius : pointSize / 2;

  const point = (flat: number): ScatterPoint | null => {
    if (!(flat >= 0 && flat < total)) return null;
    return {
      flat,
      group: gOf[flat] as number,
      index: datum[flat] as number,
      x: px[flat] as number,
      y: py[flat] as number,
      radius: radius[flat] as number,
      xValue: xv[flat] as number,
      yValue: yv[flat] as number,
      size: sv[flat] as number,
      color: colorOf(flat),
    };
  };

  const find = (group: number, index: number): number => {
    const r = ranges[group];
    if (!r) return -1;
    let lo = r.start;
    let hi = r.end;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if ((datum[mid] as number) < index) lo = mid + 1;
      else hi = mid;
    }
    return lo < r.end && datum[lo] === index ? lo : -1;
  };

  const hitTest = (x: number, y: number): number => {
    if (total === 0 || !Number.isFinite(x) || !Number.isFinite(y)) return -1;
    const t = getTree();
    if (!bubble) return t.nearest(x, y, Math.max(hitPad, largest));
    // Bubbles: the pointer may be inside a large bubble whose centre is far away. Among
    // candidates, prefer the bubble whose edge is closest (0 inside), then the smaller one.
    let best = -1;
    let bestScore = Number.POSITIVE_INFINITY;
    let bestRatio = Number.POSITIVE_INFINITY;
    for (const k of t.within(x, y, largest + hitPad)) {
      const r = radius[k] as number;
      const d = Math.hypot((px[k] as number) - x, (py[k] as number) - y);
      const score = Math.max(0, d - r);
      if (score > Math.max(hitPad - r, 4)) continue;
      const ratio = d / Math.max(r, 1);
      if (score < bestScore || (score === bestScore && ratio < bestRatio)) {
        best = k;
        bestScore = score;
        bestRatio = ratio;
      }
    }
    return best;
  };

  // Navigation order (x, then y, then datum) per group — computed on first keyboard use.
  let navOrder: Uint32Array | null = null;
  let navRank: Uint32Array | null = null;
  const nav = () => {
    if (navOrder && navRank) return { order: navOrder, rank: navRank };
    const order = new Uint32Array(total);
    const rank = new Uint32Array(total);
    for (const { start, end } of ranges) {
      const ids = Array.from({ length: end - start }, (_, k) => start + k);
      ids.sort(
        (a, b) =>
          (xv[a] as number) - (xv[b] as number) || (yv[a] as number) - (yv[b] as number) || a - b,
      );
      ids.forEach((id, k) => {
        order[start + k] = id;
        rank[id] = start + k;
      });
    }
    navOrder = order;
    navRank = rank;
    return { order, rank };
  };

  const firstGroup = () => ranges.findIndex((r) => r.end > r.start);

  const step = (flat: number, direction: ScatterStep): number => {
    if (total === 0) return -1;
    const { order, rank } = nav();
    if (!(flat >= 0 && flat < total)) {
      const g = ranges[firstGroup()] as { start: number; end: number };
      return direction === 'last' || direction === 'prev'
        ? (order[g.end - 1] as number)
        : (order[g.start] as number);
    }
    const gi = gOf[flat] as number;
    const r = ranges[gi] as { start: number; end: number };
    const pos = rank[flat] as number;
    switch (direction) {
      case 'first':
        return order[r.start] as number;
      case 'last':
        return order[r.end - 1] as number;
      case 'next':
        return order[Math.min(r.end - 1, pos + 1)] as number;
      case 'prev':
        return order[Math.max(r.start, pos - 1)] as number;
      case 'up':
      case 'down': {
        const n = ranges.length;
        let target = gi;
        for (let k = 1; k <= n; k++) {
          const cand = (gi + (direction === 'down' ? k : -k) + n * 2) % n;
          const cr = ranges[cand] as { start: number; end: number };
          if (cr.end > cr.start) {
            target = cand;
            break;
          }
        }
        if (target === gi) return flat;
        // Nearest point of the other group along x (binary search over its x order).
        const tr = ranges[target] as { start: number; end: number };
        const x = xv[flat] as number;
        let lo = tr.start;
        let hi = tr.end;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if ((xv[order[mid] as number] as number) < x) lo = mid + 1;
          else hi = mid;
        }
        let best = order[Math.min(lo, tr.end - 1)] as number;
        let bestD = Number.POSITIVE_INFINITY;
        for (let k = Math.max(tr.start, lo - 1); k <= Math.min(tr.end - 1, lo); k++) {
          const id = order[k] as number;
          const d = Math.hypot(
            (px[id] as number) - (px[flat] as number),
            (py[id] as number) - (py[flat] as number),
          );
          if (d < bestD) {
            bestD = d;
            best = id;
          }
        }
        return best;
      }
    }
  };

  const zeroOf = (scale: LinearScale | LogScale): number | null =>
    scale.kind === 'linear' && scale.domain[0] < 0 && scale.domain[1] > 0 ? scale.map(0) : null;

  return {
    frame,
    marks,
    labels: [],
    count: total,
    groups: ranges,
    px,
    py,
    zero: { x: zeroOf(xs), y: zeroOf(ys) },
    bubble,
    bounds,
    zoomed: Boolean(zx || zy),
    inRect(ax, ay, bx, by) {
      const l = Math.min(ax, bx);
      const r = Math.max(ax, bx);
      const t = Math.min(ay, by);
      const b = Math.max(ay, by);
      const out: number[] = [];
      for (let k = 0; k < total; k++) {
        const x = px[k] as number;
        const y = py[k] as number;
        if (x >= l && x <= r && y >= t && y <= b) out.push(k);
      }
      return out;
    },
    point,
    find,
    hitTest,
    step,
  };
}
