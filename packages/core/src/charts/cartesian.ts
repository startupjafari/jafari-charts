import { bisectLeft, bisectRight, extent, nearestIndex } from '../algorithms/search';
import type { DimensionType } from '../data/columns';
import { downsample, type DownsampleMethod } from '../data/downsample';
import { stack, type StackOffset } from '../data/stack';
import { formatDate, inferDateFormat } from '../formatting/date';
import { createTickFormat } from '../formatting/number';
import { onFillColor } from '../color/color';
import { estimateTextWidth } from '../formatting/text';
import type { CornerRadii, SymbolShape } from '../geometry/shapes';
import type { CurveType } from '../interpolation/curves';
import { isBandScale, type BandScale } from '../scales/band';
import {
  baselinePosition,
  computeCartesianFrame,
  resolveValueDomain,
  type AxisSpec,
  type CartesianFrame,
  type ValueDomainOptions,
} from '../layout/cartesian';
import type { LinearScale } from '../scales/linear';
import type { LogScale } from '../scales/log';
import { areaGradient, type Mark, type RectMark, type TextMark } from '../scene/marks';
import type { Extent, Margins, Rect } from '../types';

export type CartesianSeriesType = 'line' | 'area' | 'bar';

export interface CartesianSeriesSpec {
  id: string;
  label: string;
  /** Any CSS colour, including `var(--jc-series-1)`. */
  color: string;
  type: CartesianSeriesType;
  /** Values aligned with the x dimension; NaN marks a missing value. */
  values: Float64Array;
  /** Explicit lower bounds (floating bars, waterfall). */
  base?: Float64Array;
  /** Values shown in labels when they differ from the plotted values (waterfall deltas). */
  display?: Float64Array;
  curve?: CurveType;
  dash?: string;
  axis?: 'y' | 'y2';
  /** Series sharing a stack id are stacked on each other. */
  stack?: string;
  symbol?: SymbolShape;
  visible?: boolean;
  /** Draw a marker on every point. Isolated points are always drawn. */
  dots?: boolean;
  strokeWidth?: number;
  /** Area fill style (areas only). */
  fill?: 'gradient' | 'solid';
  fillOpacity?: number;
  /** Per-datum bar colours (e.g. waterfall increases/decreases). */
  colors?: readonly (string | undefined)[];
}

export interface CartesianAxisOptions extends ValueDomainOptions {
  scale?: 'linear' | 'log';
  format?: (value: number) => string;
  hidden?: boolean;
  tickCount?: number;
}

export interface CartesianSpec {
  width: number;
  height: number;
  /** `horizontal` puts categories on the y axis (horizontal bars). */
  orientation?: 'vertical' | 'horizontal';
  x: {
    type: DimensionType;
    /** Numeric/time values, sorted ascending for continuous types. */
    values: Float64Array;
    /** Category labels (also used for time values rendered as bands). */
    labels: readonly string[];
    utc?: boolean;
    /** Tick label formatter for continuous axes. */
    format?: (value: number) => string;
    hidden?: boolean;
    tickCount?: number;
    /** Visible domain of a continuous axis (zoom). */
    domain?: Extent;
    /**
     * Visible window of a band (category) axis as inclusive positions `[start, end]`
     * (categorical zoom). Only those categories are laid out, filling the plot.
     */
    range?: readonly [number, number];
    /** Force a band scale (bars always use one). */
    band?: boolean;
  };
  y?: CartesianAxisOptions;
  y2?: CartesianAxisOptions;
  series: readonly CartesianSeriesSpec[];
  stackOffset?: StackOffset;
  bar?: {
    radius?: number;
    /** Maximum bar thickness, px. */
    maxSize?: number;
    /** Gap between touching bars (grouped and stacked), px. */
    gap?: number;
    /** Space between categories as a fraction of the step (0–1). */
    categoryGap?: number;
  };
  dotSize?: number;
  padding?: Partial<Margins>;
  fontSize?: number;
  locale?: string;
  /** Reduce large series to about two points per pixel (default: LTTB). */
  downsample?: false | { method?: DownsampleMethod; threshold?: number };
  /** Value labels at bar ends. */
  barLabels?: boolean;
  /** Formats bar labels; receives the raw value and series index. */
  labelFormat?: (value: number, series: number) => string;
}

export interface CartesianHit {
  /** Position in the (sorted) x dimension. */
  position: number;
  /** Series index (into `spec.series`), or -1 for the whole category. */
  series: number;
}

export interface CartesianModel {
  frame: CartesianFrame;
  marks: Mark[];
  labels: TextMark[];
  orientation: 'vertical' | 'horizontal';
  /** True when x is drawn as categories (bands). */
  band: boolean;
  /** Number of positions along x. */
  length: number;
  /** Positions inside the visible (zoomed) range, inclusive. */
  visible: [number, number];
  /** Lower/upper bound of every series in data units (stacked values are cumulative). */
  lo: Float64Array[];
  hi: Float64Array[];
  /** Pixel anchor of a series value (top of a bar / point on a line). */
  point(series: number, position: number): { x: number; y: number } | null;
  /** Pixel position of an x position along the category/x axis. */
  position(position: number): number;
  /** Position nearest to a pixel along the category/x axis (clamped to the visible range). */
  indexAt(pixel: number): number;
  /** Band rectangle of a position (for cursors), null for continuous axes. */
  bandRect(position: number): Rect | null;
  hitTest(x: number, y: number, mode?: 'shared' | 'item'): CartesianHit | null;
  /** Rectangle of a bar mark, for highlighting. */
  barRect(series: number, position: number): RectMark | null;
}

const NO_SERIES = -1;

/** Default format for category labels derived from time values. */
function timeLabels(values: Float64Array, locale: string, utc: boolean): string[] {
  const fmt = inferDateFormat(values, utc);
  // Drop the year when every value falls in the same year.
  const years = new Set<number>();
  for (let i = 0; i < Math.min(values.length, 2000); i++) {
    const t = values[i] as number;
    if (Number.isFinite(t))
      years.add(utc ? new Date(t).getUTCFullYear() : new Date(t).getFullYear());
  }
  const opts: Intl.DateTimeFormatOptions = { ...fmt };
  if (years.size <= 1) delete opts.year;
  return Array.from(values, (t) => formatDate(t, { locale, ...opts }));
}

export function buildCartesianModel(spec: CartesianSpec): CartesianModel {
  const orientation = spec.orientation ?? 'vertical';
  const horizontal = orientation === 'horizontal';
  const locale = spec.locale ?? 'en';
  const fontSize = spec.fontSize ?? 11;
  const series = spec.series;
  const n = Math.max(spec.x.values.length, spec.x.labels.length);
  const visibleOf = (s: CartesianSeriesSpec) => s.visible !== false;
  const hasBars = series.some((s) => s.type === 'bar');
  const band = hasBars || spec.x.type === 'category' || spec.x.band === true;

  // ---- 1. Stacking -------------------------------------------------------------------------
  const lo: Float64Array[] = series.map(() => new Float64Array(n));
  const hi: Float64Array[] = series.map((s) => s.values);
  const stacks = new Map<string, number[]>();
  series.forEach((s, i) => {
    if (s.stack && visibleOf(s)) stacks.set(s.stack, [...(stacks.get(s.stack) ?? []), i]);
  });
  const stackOffset = spec.stackOffset ?? 'diverging';
  for (const members of stacks.values()) {
    const offset =
      series[members[0] as number]?.type === 'area' && stackOffset === 'diverging'
        ? 'zero'
        : stackOffset;
    const result = stack(
      members.map((i) => (series[i] as CartesianSeriesSpec).values),
      offset,
    );
    members.forEach((i, k) => {
      lo[i] = result.y0[k] as Float64Array;
      hi[i] = result.y1[k] as Float64Array;
      // Keep gaps where the original value is missing (lines/areas break there).
      const raw = (series[i] as CartesianSeriesSpec).values;
      const top = new Float64Array(hi[i] as Float64Array);
      for (let p = 0; p < n; p++)
        if (!Number.isFinite(raw[p] as number) && series[i]?.type !== 'bar') top[p] = Number.NaN;
      hi[i] = top;
    });
  }
  series.forEach((s, i) => {
    if (s.base) lo[i] = s.base;
  });

  // ---- 2. Visible x range (zoom) -----------------------------------------------------------
  const xs = spec.x.values;
  let v0 = 0;
  let v1 = n - 1;
  if (!band && spec.x.domain && n > 0) {
    v0 = Math.max(0, bisectLeft(xs, spec.x.domain[0]) - 1);
    v1 = Math.min(n - 1, bisectRight(xs, spec.x.domain[1]));
  } else if (band && spec.x.range && n > 0) {
    const [r0, r1] = spec.x.range;
    const a = Math.round(Math.min(r0, r1));
    const b = Math.round(Math.max(r0, r1));
    if (Number.isFinite(a) && Number.isFinite(b)) {
      v0 = Math.min(n - 1, Math.max(0, a));
      v1 = Math.min(n - 1, Math.max(v0, b));
    }
  }
  /** First drawn band: band scales index positions relative to it. */
  const bandOffset = band ? v0 : 0;

  // ---- 3. Value domains --------------------------------------------------------------------
  const domainFor = (axis: 'y' | 'y2'): Extent => {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let anyFill = false;
    series.forEach((s, i) => {
      if (!visibleOf(s) || (s.axis ?? 'y') !== axis) return;
      const h = hi[i] as Float64Array;
      const l = lo[i] as Float64Array;
      const filled = s.type !== 'line' || Boolean(s.stack) || Boolean(s.base);
      if (filled) anyFill = true;
      for (let p = v0; p <= v1; p++) {
        const v = h[p] as number;
        if (Number.isFinite(v)) {
          if (v < min) min = v;
          if (v > max) max = v;
        }
        if (filled) {
          const b = l[p] as number;
          if (Number.isFinite(b) && Number.isFinite(s.values[p] as number)) {
            if (b < min) min = b;
            if (b > max) max = b;
          }
        }
      }
    });
    const opts = axis === 'y' ? spec.y : spec.y2;
    const log = opts?.scale === 'log';
    const expand = stackOffset === 'expand' && stacks.size > 0 && axis === 'y';
    return resolveValueDomain(expand ? [Math.min(0, min), Math.max(1, max)] : [min, max], {
      includeZero: opts?.includeZero ?? (anyFill ? true : 'auto'),
      nice: opts?.nice ?? !expand,
      log,
      ...(opts?.min !== undefined ? { min: opts.min } : expand ? { min: Math.min(0, min) } : {}),
      ...(opts?.max !== undefined ? { max: opts.max } : expand ? { max: 1 } : {}),
    });
  };

  const usesY2 = series.some((s) => s.axis === 'y2');
  const valueAxis = (axis: 'y' | 'y2'): AxisSpec => {
    const opts = axis === 'y' ? spec.y : spec.y2;
    const expand = stackOffset === 'expand' && stacks.size > 0 && axis === 'y';
    const format = opts?.format ?? (expand ? (v: number) => `${Math.round(v * 100)}%` : undefined);
    return {
      kind: opts?.scale === 'log' ? 'log' : 'linear',
      domain: domainFor(axis),
      ...(format ? { format } : {}),
      ...(opts?.hidden ? { hidden: true } : {}),
      ...(opts?.tickCount !== undefined ? { tickCount: opts.tickCount } : {}),
    };
  };

  // ---- 4. Category axis --------------------------------------------------------------------
  let categoryAxis: AxisSpec;
  if (band) {
    let labels = spec.x.labels;
    if (spec.x.type === 'time' && labels.length !== n)
      labels = timeLabels(xs, locale, spec.x.utc ?? false);
    else if (spec.x.type === 'number' && labels.length !== n) {
      const f = spec.x.format ?? createTickFormat(Array.from(xs.subarray(0, 2)), locale);
      labels = Array.from(xs, (v) => f(v));
    }
    categoryAxis = {
      kind: 'band',
      labels: bandOffset > 0 || v1 < n - 1 ? labels.slice(v0, v1 + 1) : labels,
      paddingInner: spec.bar?.categoryGap ?? (hasBars ? 0.3 : 0),
      paddingOuter: hasBars ? 0.15 : 0.5,
      ...(bandOffset ? { offset: bandOffset } : {}),
      ...(spec.x.hidden ? { hidden: true } : {}),
    };
  } else {
    const [e0, e1] = n > 0 ? [xs[0] as number, xs[n - 1] as number] : [Number.NaN, Number.NaN];
    const full: Extent =
      Number.isFinite(e0) && Number.isFinite(e1)
        ? e0 === e1
          ? [e0 - 1, e1 + 1]
          : [e0, e1]
        : [0, 1];
    const domain = spec.x.domain ?? full;
    categoryAxis =
      spec.x.type === 'time'
        ? {
            kind: 'time',
            domain,
            utc: spec.x.utc ?? false,
            ...(spec.x.format ? { format: spec.x.format } : {}),
            ...(spec.x.hidden ? { hidden: true } : {}),
            ...(spec.x.tickCount !== undefined ? { tickCount: spec.x.tickCount } : {}),
          }
        : {
            kind: 'linear',
            domain,
            ...(spec.x.format ? { format: spec.x.format } : {}),
            ...(spec.x.hidden ? { hidden: true } : {}),
            ...(spec.x.tickCount !== undefined ? { tickCount: spec.x.tickCount } : {}),
          };
  }

  const frame = computeCartesianFrame({
    width: spec.width,
    height: spec.height,
    x: horizontal ? valueAxis('y') : categoryAxis,
    y: horizontal ? categoryAxis : valueAxis('y'),
    ...(usesY2 && !horizontal ? { y2: valueAxis('y2') } : {}),
    ...(spec.padding ? { padding: spec.padding } : {}),
    fontSize,
    locale,
  });

  const catScale = horizontal ? frame.y : frame.x;
  const valScale = (horizontal ? frame.x : frame.y) as LinearScale | LogScale;
  const scaleFor = (s: CartesianSeriesSpec): LinearScale | LogScale =>
    s.axis === 'y2' && frame.y2 ? frame.y2 : valScale;
  const bandScale = isBandScale(catScale) ? (catScale as BandScale) : null;

  const catPos = (p: number): number =>
    bandScale ? bandScale.center(p - bandOffset) : (catScale as LinearScale).map(xs[p] as number);
  const indexAt = (pixel: number): number => {
    if (n === 0) return -1;
    const p = bandScale
      ? bandScale.invert(pixel) + bandOffset
      : nearestIndex(xs, (catScale as LinearScale).invert(pixel));
    return Math.min(v1, Math.max(v0, p));
  };

  // ---- 5. Bar geometry ---------------------------------------------------------------------
  const barSeries = series
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.type === 'bar' && visibleOf(s));
  const slotKeys: string[] = [];
  const slotOf = new Map<number, number>();
  for (const { s, i } of barSeries) {
    const key = s.stack ? `stack:${s.stack}` : `series:${s.id}`;
    let slot = slotKeys.indexOf(key);
    if (slot < 0) {
      slot = slotKeys.length;
      slotKeys.push(key);
    }
    slotOf.set(i, slot);
  }
  const gap = spec.bar?.gap ?? 2;
  const radius = spec.bar?.radius ?? 4;
  const maxSize = spec.bar?.maxSize ?? 24;
  const slots = Math.max(1, slotKeys.length);
  const bw = bandScale ? bandScale.bandwidth : 0;
  const barSize = Math.max(1, Math.min(maxSize, (bw - (slots - 1) * gap) / slots));
  const groupSize = slots * barSize + (slots - 1) * gap;
  const slotOffset = (slot: number) => -groupSize / 2 + slot * (barSize + gap);

  const marks: Mark[] = [];
  const labels: TextMark[] = [];
  const barRects = new Map<string, RectMark>();
  const keyOf = (p: number) => (band ? `${spec.x.labels[p] ?? xs[p]}#${p}` : String(xs[p]));

  if (bandScale && barSeries.length) {
    const base0 = baselinePosition(valScale);
    // Outermost visible stacked segment per (slot, position, sign) gets the rounded end;
    // inner segments leave a surface gap.
    const outer = new Map<string, number>();
    for (const { s, i } of barSeries) {
      if (!s.stack) continue;
      for (let p = v0; p <= v1; p++) {
        const v = s.values[p] as number;
        if (!Number.isFinite(v) || v === 0) continue;
        outer.set(`${slotOf.get(i)}:${p}:${v > 0 ? '+' : '-'}`, i);
      }
    }
    for (const { s, i } of barSeries) {
      const scale = scaleFor(s);
      const slot = slotOf.get(i) as number;
      const base = s.base ? null : baselinePosition(scale);
      for (let p = v0; p <= v1; p++) {
        const raw = s.values[p] as number;
        if (!Number.isFinite(raw)) continue;
        const loValue = lo[i]?.[p] ?? 0;
        // Log scales have no zero: bars start at the bottom of the axis.
        const v0p = scale.kind === 'log' && !(loValue > 0) ? scale.range[0] : scale.map(loValue);
        const v1p = scale.map(hi[i]?.[p] ?? raw);
        if (!Number.isFinite(v0p) || !Number.isFinite(v1p)) continue;
        const positive = s.base ? true : raw >= 0;
        const isOuter = !s.stack || outer.get(`${slot}:${p}:${raw >= 0 ? '+' : '-'}`) === i;
        const start = v0p;
        let end = v1p;
        // Surface gap between stacked segments: shorten inner segments at their far end.
        if (s.stack && !isOuter) {
          const dir = Math.sign(end - start);
          const len = Math.max(0, Math.abs(end - start) - gap);
          end = start + dir * len;
        }
        const r = s.base ? Math.min(radius, 3) : isOuter ? radius : 0;
        // Data end is "up" for positive vertical bars (smaller y), "right" for horizontal.
        let radii: CornerRadii;
        if (s.base) radii = [r, r, r, r];
        else if (horizontal) radii = positive ? [0, r, r, 0] : [r, 0, 0, r];
        else radii = positive ? [r, r, 0, 0] : [0, 0, r, r];
        const along = catPos(p) + slotOffset(slot);
        const key = `${s.id}|${keyOf(p)}`;
        const color = s.colors?.[p] ?? s.color;
        const grow = base ?? (s.base ? start : base0);
        const rect: RectMark = horizontal
          ? {
              type: 'rect',
              key,
              x: Math.min(start, end),
              y: along,
              width: Math.abs(end - start),
              height: barSize,
              radius: radii,
              fill: color,
              series: i,
              index: p,
              enter: { x: grow, width: 0 },
            }
          : {
              type: 'rect',
              key,
              x: along,
              y: Math.min(start, end),
              width: barSize,
              height: Math.abs(end - start),
              radius: radii,
              fill: color,
              series: i,
              index: p,
              enter: { y: grow, height: 0 },
            };
        marks.push(rect);
        barRects.set(`${i}:${p}`, rect);

        if (spec.barLabels && !s.stack) {
          const shown = s.display ? (s.display[p] as number) : raw;
          const text = spec.labelFormat ? spec.labelFormat(shown, i) : String(shown);
          const tw = estimateTextWidth(text, fontSize);
          if (horizontal) {
            const outside = positive ? rect.x + rect.width + 6 : rect.x - 6;
            const room = positive
              ? frame.plot.x + frame.plot.width - outside
              : outside - frame.plot.x;
            const inside = tw + 12 <= rect.width;
            if (room >= tw || !inside) {
              labels.push({
                key: `lbl|${key}`,
                x: outside,
                y: along + barSize / 2,
                text,
                anchor: positive ? 'start' : 'end',
                baseline: 'middle',
                tone: 'primary',
              });
            } else {
              labels.push({
                key: `lbl|${key}`,
                x: positive ? rect.x + rect.width - 6 : rect.x + 6,
                y: along + barSize / 2,
                text,
                anchor: positive ? 'end' : 'start',
                baseline: 'middle',
                fill: onFillColor(color),
                fontWeight: 600,
              });
            }
          } else if (tw <= barSize + 24) {
            labels.push({
              key: `lbl|${key}`,
              x: along + barSize / 2,
              y: positive ? rect.y - 6 : rect.y + rect.height + 6,
              text,
              anchor: 'middle',
              baseline: positive ? 'auto' : 'hanging',
              tone: 'primary',
            });
          }
        }
      }
    }
  }

  // ---- 6. Lines and areas ------------------------------------------------------------------
  const plotPixels = horizontal ? frame.plot.height : frame.plot.width;
  const threshold =
    spec.downsample === false
      ? Number.POSITIVE_INFINITY
      : (spec.downsample?.threshold ?? Math.max(64, Math.round(plotPixels * 2)));
  const method = spec.downsample ? (spec.downsample.method ?? 'lttb') : 'lttb';
  const count = v1 - v0 + 1;

  // Shared indices for stacked areas so boundaries stay aligned after downsampling.
  const sharedIdx = new Map<string, Uint32Array>();
  const indicesFor = (i: number): Uint32Array => {
    const s = series[i] as CartesianSeriesSpec;
    if (count <= threshold || band)
      return Uint32Array.from({ length: Math.max(0, count) }, (_, k) => v0 + k);
    const key = s.stack ? `stack:${s.stack}` : `s:${i}`;
    const cached = sharedIdx.get(key);
    if (cached) return cached;
    const subX = xs.subarray(v0, v1 + 1);
    const subY = (hi[i] as Float64Array).subarray(v0, v1 + 1);
    const local = downsample(subX, subY, threshold, method);
    const idx = local.map((k) => k + v0);
    sharedIdx.set(key, idx);
    return idx;
  };

  const dotSize = spec.dotSize ?? 8;
  series.forEach((s, i) => {
    if (s.type === 'bar' || !visibleOf(s) || n === 0) return;
    const scale = scaleFor(s);
    const idx = indicesFor(i);
    const m = idx.length;
    const px = new Float64Array(m);
    const py = new Float64Array(m);
    const h = hi[i] as Float64Array;
    for (let k = 0; k < m; k++) {
      const p = idx[k] as number;
      px[k] = catPos(p);
      py[k] = scale.map(h[p] as number);
    }
    const [cx, cy] = horizontal ? [py, px] : [px, py];
    const curve = s.curve ?? 'monotone';
    const base = baselinePosition(scale);

    if (s.type === 'area') {
      let y0: Float64Array | number = base;
      if (s.stack || s.base) {
        const l = lo[i] as Float64Array;
        y0 = new Float64Array(m);
        for (let k = 0; k < m; k++) y0[k] = scale.map(l[idx[k] as number] as number);
      }
      let top = base;
      let bottom = base;
      for (let k = 0; k < m; k++) {
        const v = py[k] as number;
        if (v < top) top = v;
        if (v > bottom) bottom = v;
      }
      const fill =
        (s.fill ?? 'gradient') === 'gradient'
          ? areaGradient(
              s.color,
              horizontal ? 0 : top,
              horizontal ? 0 : base,
              horizontal ? 0 : bottom,
              s.stack ? 0.3 : 0.24,
              s.stack ? 0.12 : 0,
            )
          : s.color;
      const enterY = new Float64Array(m).fill(typeof y0 === 'number' ? y0 : Number.NaN);
      if (typeof y0 !== 'number') enterY.set(y0);
      marks.push({
        type: 'area',
        key: `${s.id}|area`,
        xs: cx,
        y1s: cy,
        y0s: y0,
        curve,
        fill,
        ...(s.fill === 'solid' ? { fillOpacity: s.fillOpacity ?? 0.14 } : {}),
        series: i,
        enter: { y1s: enterY },
      });
    }
    marks.push({
      type: 'line',
      key: `${s.id}|line`,
      xs: cx,
      ys: cy,
      curve,
      stroke: s.color,
      strokeWidth: s.strokeWidth ?? 2,
      ...(s.dash ? { dash: s.dash } : {}),
      series: i,
      enter: { ys: new Float64Array(m).fill(base) },
    });

    // Dots: every point when requested, otherwise isolated points (between gaps) only.
    const dx: number[] = [];
    const dy: number[] = [];
    const di: number[] = [];
    for (let k = 0; k < m; k++) {
      if (!Number.isFinite(py[k] as number)) continue;
      const isolated =
        (k === 0 || !Number.isFinite(py[k - 1] as number)) &&
        (k === m - 1 || !Number.isFinite(py[k + 1] as number));
      if (s.dots || isolated) {
        dx.push(cx[k] as number);
        dy.push(cy[k] as number);
        di.push(idx[k] as number);
      }
    }
    if (dx.length) {
      marks.push({
        type: 'symbol',
        key: `${s.id}|dots`,
        xs: Float64Array.from(dx),
        ys: Float64Array.from(dy),
        indices: Uint32Array.from(di),
        size: dotSize,
        shape: s.symbol ?? 'circle',
        fill: s.color,
        stroke: 'var(--jc-bg)',
        strokeWidth: 4,
        series: i,
        enter: { size: 0 },
      });
    }
  });

  // ---- 7. Queries --------------------------------------------------------------------------
  const plot = frame.plot;
  const point = (si: number, p: number) => {
    const s = series[si];
    if (!s || p < 0 || p >= n) return null;
    const scale = scaleFor(s);
    const v = (hi[si] as Float64Array)[p] as number;
    if (!Number.isFinite(v) || !Number.isFinite(s.values[p] as number)) return null;
    let along = catPos(p);
    if (s.type === 'bar' && bandScale) along += slotOffset(slotOf.get(si) ?? 0) + barSize / 2;
    const val = scale.map(v);
    if (!Number.isFinite(val)) return null;
    return horizontal ? { x: val, y: along } : { x: along, y: val };
  };

  const hitTest = (
    x: number,
    y: number,
    mode: 'shared' | 'item' = 'shared',
  ): CartesianHit | null => {
    if (n === 0) return null;
    const tol = 8;
    if (
      x < plot.x - tol ||
      x > plot.x + plot.width + tol ||
      y < plot.y - tol ||
      y > plot.y + plot.height + tol
    )
      return null;
    const along = horizontal ? y : x;
    let p: number;
    if (bandScale) p = bandScale.invert(along) + bandOffset;
    else {
      const value = (catScale as LinearScale).invert(along);
      p = nearestIndex(xs, value);
    }
    if (p < v0 || p > v1 || p < 0) return null;
    if (mode === 'shared') return { position: p, series: NO_SERIES };
    // Item mode: the bar under the pointer, or the nearest series value.
    let best = NO_SERIES;
    let bestD = Number.POSITIVE_INFINITY;
    series.forEach((s, si) => {
      if (!visibleOf(s)) return;
      if (s.type === 'bar') {
        const r = barRects.get(`${si}:${p}`);
        if (!r) return;
        const inside =
          x >= r.x - 2 && x <= r.x + r.width + 2 && y >= r.y - 2 && y <= r.y + r.height + 2;
        const d = inside
          ? 0
          : horizontal
            ? Math.abs(y - (r.y + r.height / 2)) + 1000
            : Math.abs(x - (r.x + r.width / 2)) + 1000;
        if (d < bestD) {
          bestD = d;
          best = si;
        }
        return;
      }
      const pt = point(si, p);
      if (!pt) return;
      const d = horizontal ? Math.abs(pt.x - x) : Math.abs(pt.y - y);
      if (d < bestD) {
        bestD = d;
        best = si;
      }
    });
    return { position: p, series: best };
  };

  return {
    frame,
    marks,
    labels,
    orientation,
    band,
    length: n,
    visible: [v0, v1],
    lo,
    hi,
    point,
    position: catPos,
    indexAt,
    bandRect(p) {
      if (!bandScale || p < v0 || p > v1) return null;
      const start = bandScale.position(p - bandOffset) - (bandScale.step - bandScale.bandwidth) / 2;
      return horizontal
        ? { x: plot.x, y: start, width: plot.width, height: bandScale.step }
        : { x: start, y: plot.y, width: bandScale.step, height: plot.height };
    },
    hitTest,
    barRect: (si, p) => barRects.get(`${si}:${p}`) ?? null,
  };
}

/** Value extent of the x dimension (for zoom bounds). */
export function xExtent(values: Float64Array): Extent {
  return extent(values);
}
