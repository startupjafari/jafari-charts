import { onFillColor, sampleRamp } from '../color/color';
import { estimateTextWidth } from '../formatting/text';
import { computeCartesianFrame, type CartesianFrame } from '../layout/cartesian';
import type { BandScale } from '../scales/band';
import type { Mark, RectMark, TextMark } from '../scene/marks';
import type { Margins, Rect } from '../types';

// ---------------------------------------------------------------------------------------------
// Quantized colour scale (shared by the heatmap and the calendar heatmap)
// ---------------------------------------------------------------------------------------------

export interface HeatmapColorOptions {
  /** `sequential`: one hue from light to dark. `diverging`: negative hue ← neutral → positive hue. */
  scale?: 'sequential' | 'diverging';
  /** Number of colour steps (default 5). Each step is drawn as one batched path. */
  buckets?: number;
  /** Explicit ascending bucket boundaries; overrides `buckets` (n thresholds → n + 1 buckets). */
  thresholds?: readonly number[];
  /** Value domain; defaults to the data extent (symmetric around `midpoint` when diverging). */
  domain?: readonly [number, number];
  /** Neutral value of a diverging scale (default 0). */
  midpoint?: number;
  /** Sequential hue (default `var(--jc-series-1)`); steps differ by fill opacity. */
  color?: string;
  /** Diverging hue below the midpoint (default `var(--jc-negative)`). */
  negativeColor?: string;
  /** Diverging hue above the midpoint (default `var(--jc-positive)`). */
  positiveColor?: string;
  /** Concrete colour ramp, low → high (diverging: negative → neutral → positive), sampled per bucket. */
  colors?: readonly string[];
  /** Fill of missing cells and of the neutral diverging step (default `var(--jc-track)`). */
  emptyColor?: string;
  /** Values ≤ 0 count as empty (activity data: "no contributions"). */
  zeroAsEmpty?: boolean;
}

export interface HeatmapBucket {
  index: number;
  /** Value range covered by the bucket (`from` inclusive; `to` inclusive for the last one). */
  from: number;
  to: number;
  fill: string;
  /** Opacity step of the single-hue encodings (undefined for concrete ramps). */
  fillOpacity?: number;
  /** Ink for text drawn inside cells of this bucket. */
  ink: InkStyle;
}

/** Style of empty / missing cells. */
export interface EmptyFill {
  fill: string;
  fillOpacity?: number;
  /**
   * Dashed outline instead of a fill, used when a colour step already wears the
   * empty colour (the neutral step of a diverging scale), so "no data" stays distinct.
   */
  stroke?: string;
  strokeWidth?: number;
  dash?: string;
}

/** Visual style of a cell. */
export interface HeatmapCellStyle {
  fill: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  dash?: string;
}

export interface InkStyle {
  /** Explicit text colour (concrete fills). */
  fill?: string;
  /** Theme text tone (translucent or token fills: the theme text reads on both modes). */
  tone?: 'primary';
}

export interface HeatmapColorScale {
  kind: 'sequential' | 'diverging';
  /** Resolved value domain the buckets span. */
  domain: [number, number];
  buckets: HeatmapBucket[];
  empty: EmptyFill;
  /** Bucket index of a value, or -1 for missing (and, with `zeroAsEmpty`, non-positive) values. */
  bucketOf(value: number): number;
}

const MAX_BUCKETS = 12;

/** Opacity of sequential step `i` of `n` (≥ 0.12 so the first step never vanishes). */
function stepOpacity(i: number, n: number): number {
  return n <= 1 ? 1 : Math.max(0.12, Math.round(((i + 1) / n) * 1000) / 1000);
}

function inkFor(fill: string, fillOpacity: number | undefined): InkStyle {
  // A translucent step mostly shows the chart background: the theme text colour reads
  // in both light and dark mode. Opaque steps use the validated on-fill ink.
  if (fillOpacity !== undefined && fillOpacity < 0.7) return { tone: 'primary' };
  if (fill.startsWith('var(--jc-track') || fill.startsWith('var(--jc-bg'))
    return { tone: 'primary' };
  return { fill: onFillColor(fill) };
}

/**
 * Quantizes values into a small number of colour steps. Single-hue steps differ only
 * by fill opacity, so every step renders as one batched SVG path whatever the grid
 * size; concrete `colors` ramps are sampled in OKLab instead.
 */
export function resolveHeatmapColors(
  values: ArrayLike<number>,
  options: HeatmapColorOptions = {},
): HeatmapColorScale {
  const kind = options.scale ?? 'sequential';
  const zeroAsEmpty = options.zeroAsEmpty ?? false;
  const emptyColor = options.emptyColor ?? 'var(--jc-track)';
  const thresholds = (options.thresholds ?? [])
    .filter((t) => Number.isFinite(t))
    .slice()
    .sort((a, b) => a - b);
  const n = thresholds.length
    ? Math.min(MAX_BUCKETS + 1, thresholds.length + 1)
    : Math.max(1, Math.min(MAX_BUCKETS, Math.round(options.buckets ?? 5)));

  // ---- Domain --------------------------------------------------------------------------------
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] as number;
    if (!Number.isFinite(v) || (zeroAsEmpty && v <= 0)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min)) {
    min = 0;
    max = 1;
  }
  let lo: number;
  let hi: number;
  if (kind === 'diverging') {
    const mid = options.midpoint ?? 0;
    const ext = Math.max(Math.abs(min - mid), Math.abs(max - mid)) || 1;
    [lo, hi] = [mid - ext, mid + ext];
  } else if (zeroAsEmpty) {
    [lo, hi] = [0, max];
  } else {
    [lo, hi] = [min, max];
    if (lo === hi) {
      // All values equal: positive → strongest step, zero → lightest, negative → lightest.
      if (lo > 0) lo = 0;
      else if (lo === 0) hi = 1;
      else hi = 0;
    }
  }
  if (options.domain && Number.isFinite(options.domain[0]) && Number.isFinite(options.domain[1])) {
    [lo, hi] = [options.domain[0], options.domain[1]];
    if (hi < lo) [lo, hi] = [hi, lo];
  }
  if (hi === lo) hi = lo + 1;
  if (thresholds.length) {
    lo = Math.min(lo, thresholds[0] as number);
    hi = Math.max(hi, thresholds.at(-1) as number);
  }
  const span = hi - lo;

  // ---- Bucket assignment ----------------------------------------------------------------------
  const cut = thresholds.slice(0, n - 1);
  const bucketOf = (v: number): number => {
    if (!Number.isFinite(v) || (zeroAsEmpty && v <= 0)) return -1;
    if (cut.length) {
      // Number of thresholds ≤ v (binary search).
      let a = 0;
      let b = cut.length;
      while (a < b) {
        const m = (a + b) >>> 1;
        if ((cut[m] as number) <= v) a = m + 1;
        else b = m;
      }
      return a;
    }
    const t = (v - lo) / span;
    // Zero-based activity scales close buckets on the right: (0, w] is the first step.
    const i = zeroAsEmpty && kind === 'sequential' ? Math.ceil(t * n) - 1 : Math.floor(t * n);
    return Math.min(n - 1, Math.max(0, i));
  };

  // ---- Bucket colours ------------------------------------------------------------------------
  const ramp = options.colors?.length ? options.colors : null;
  const seqColor = options.color ?? 'var(--jc-series-1)';
  const negColor = options.negativeColor ?? 'var(--jc-negative)';
  const posColor = options.positiveColor ?? 'var(--jc-positive)';
  const buckets: HeatmapBucket[] = [];
  for (let i = 0; i < n; i++) {
    const from = cut.length ? (i === 0 ? lo : (cut[i - 1] as number)) : lo + (span * i) / n;
    const to = cut.length ? (i === n - 1 ? hi : (cut[i] as number)) : lo + (span * (i + 1)) / n;
    let fill: string;
    let fillOpacity: number | undefined;
    if (ramp) {
      fill = ramp.length === n ? (ramp[i] as string) : sampleRamp(ramp, n === 1 ? 1 : i / (n - 1));
    } else if (kind === 'diverging') {
      const centre = (n - 1) / 2;
      const d = i - centre;
      const side = Math.floor(n / 2);
      if (d === 0) {
        fill = emptyColor;
      } else {
        fill = d < 0 ? negColor : posColor;
        const step = n % 2 === 1 ? Math.abs(d) : Math.abs(d) + 0.5;
        fillOpacity = side <= 1 ? 1 : Math.round((step / side) * 1000) / 1000;
      }
    } else {
      fill = seqColor;
      fillOpacity = stepOpacity(i, n);
    }
    buckets.push({
      index: i,
      from,
      to,
      fill,
      ...(fillOpacity !== undefined && fillOpacity < 1 ? { fillOpacity } : {}),
      ink: inkFor(fill, fillOpacity !== undefined && fillOpacity < 1 ? fillOpacity : undefined),
    });
  }

  const clash = buckets.some((b) => b.fill === emptyColor && b.fillOpacity === undefined);
  const empty: EmptyFill = clash
    ? { fill: 'transparent', stroke: 'var(--jc-text-muted)', strokeWidth: 1, dash: '3 2' }
    : { fill: emptyColor };
  return { kind, domain: [lo, hi], buckets, empty, bucketOf };
}

// ---------------------------------------------------------------------------------------------
// Shared cell helpers
// ---------------------------------------------------------------------------------------------

/** Style of a cell in bucket `b` (-1 = empty). */
export function heatmapCellStyle(scale: HeatmapColorScale, bucket: number): HeatmapCellStyle {
  const b = bucket >= 0 ? scale.buckets[bucket] : undefined;
  if (!b) return { ...scale.empty };
  return b.fillOpacity !== undefined
    ? { fill: b.fill, fillOpacity: b.fillOpacity }
    : { fill: b.fill };
}

/**
 * Emphasis marks for an active cell: a background halo (so the cell keeps its true
 * colour above the dimmed layer), the cell grown by `lift` px, and an outline.
 */
export function heatmapActiveMarks(
  rect: Rect,
  style: HeatmapCellStyle,
  key: string,
  radius: number,
  lift = 1.5,
): Mark[] {
  const x = rect.x - lift;
  const y = rect.y - lift;
  const width = rect.width + lift * 2;
  const height = rect.height + lift * 2;
  const r = radius + lift / 2;
  const base = { type: 'rect' as const, x, y, width, height, radius: r, series: -1 };
  return [
    { ...base, key: `active-bg|${key}`, fill: 'var(--jc-bg)' },
    { ...base, key: `active|${key}`, ...style },
    {
      ...base,
      key: `active-ring|${key}`,
      fill: 'transparent',
      stroke: 'var(--jc-text)',
      strokeWidth: 1.5,
    },
  ];
}

/**
 * Orders cell marks by legend slot (`series`) so that `batchMarks` merges every
 * colour step into one path. Counting sort: O(cells), stable within a slot.
 */
export function sortHeatmapCells<M extends Mark>(marks: readonly M[], slots: number): M[] {
  const starts = new Uint32Array(slots + 1);
  const slotOf = (m: M) => Math.min(slots - 1, Math.max(0, m.series ?? 0));
  for (const m of marks) {
    const k = slotOf(m) + 1;
    starts[k] = (starts[k] as number) + 1;
  }
  for (let i = 1; i <= slots; i++) starts[i] = (starts[i] as number) + (starts[i - 1] as number);
  const out = new Array<M>(marks.length);
  for (const m of marks) {
    const k = slotOf(m);
    const at = starts[k] as number;
    out[at] = m;
    starts[k] = at + 1;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Heatmap (categories × categories)
// ---------------------------------------------------------------------------------------------

export interface HeatmapFrameAxis {
  hidden?: boolean;
  format?: (label: string, index: number) => string;
  /** Longest a tick label may be before it is truncated, px. */
  maxLabelWidth?: number;
}

export interface HeatmapSpec {
  width: number;
  height: number;
  /** Categories along x (columns), left → right. */
  xLabels: readonly string[];
  /** Categories along y (rows), top → bottom. */
  yLabels: readonly string[];
  /** Row-major grid `values[y * xLabels.length + x]`; NaN marks a missing cell. */
  values: Float64Array;
  colors?: HeatmapColorOptions;
  /** Surface gap between cells, px (default 2). */
  gap?: number;
  /** Cell corner radius, px (default 3, limited by the cell size). */
  cornerRadius?: number;
  /** Value labels inside cells (only where they fit). */
  labels?: boolean;
  labelFormat?: (value: number, x: number, y: number) => string;
  fontSize?: number;
  locale?: string;
  padding?: Partial<Margins>;
  xAxis?: HeatmapFrameAxis;
  yAxis?: HeatmapFrameAxis;
}

export interface HeatmapModel {
  frame: CartesianFrame;
  columns: number;
  rows: number;
  scale: HeatmapColorScale;
  /** Bucket per cell (row-major), -1 for missing cells. */
  cellBuckets: Int8Array;
  /** Number of cells with a value. */
  defined: number;
  marks: RectMark[];
  labels: TextMark[];
  /** Cell index (`y * columns + x`) under the point, or -1. O(1) band inversion. */
  hitTest(x: number, y: number): number;
  /** Drawn rectangle of a cell (inside the surface gap). */
  cellRect(cell: number): Rect | null;
  /** Emphasis marks for the active cell. */
  activeMarks(cell: number): Mark[];
  radius: number;
}

export function buildHeatmapModel(spec: HeatmapSpec): HeatmapModel {
  const { xLabels, yLabels, values } = spec;
  const nx = xLabels.length;
  const ny = yLabels.length;
  const fontSize = spec.fontSize ?? 11;
  const frame = computeCartesianFrame({
    width: spec.width,
    height: spec.height,
    x: {
      kind: 'band',
      labels: xLabels,
      paddingInner: 0,
      paddingOuter: 0,
      ...(spec.xAxis?.hidden ? { hidden: true } : {}),
      ...(spec.xAxis?.format ? { format: spec.xAxis.format } : {}),
      ...(spec.xAxis?.maxLabelWidth !== undefined
        ? { maxLabelWidth: spec.xAxis.maxLabelWidth }
        : {}),
    },
    y: {
      kind: 'band',
      labels: yLabels,
      paddingInner: 0,
      paddingOuter: 0,
      ...(spec.yAxis?.hidden ? { hidden: true } : {}),
      ...(spec.yAxis?.format ? { format: spec.yAxis.format } : {}),
      ...(spec.yAxis?.maxLabelWidth !== undefined
        ? { maxLabelWidth: spec.yAxis.maxLabelWidth }
        : {}),
    },
    fontSize,
    ...(spec.locale ? { locale: spec.locale } : {}),
    padding: { top: 4, right: 4, bottom: 0, left: 0, ...spec.padding },
  });
  const xs = frame.x as BandScale;
  const ys = frame.y as BandScale;
  const plot = frame.plot;
  const cells = nx * ny;
  const scale = resolveHeatmapColors(values.length > cells ? values.subarray(0, cells) : values, {
    ...spec.colors,
  });
  const nb = scale.buckets.length;

  const stepX = xs.step;
  const stepY = ys.step;
  const minStep = Math.min(stepX, stepY);
  const gap = Math.max(0, Math.min(spec.gap ?? 2, minStep * 0.2));
  const cw = Math.max(0, stepX - gap);
  const ch = Math.max(0, stepY - gap);
  const radius = Math.max(0, Math.min(spec.cornerRadius ?? 3, cw / 4, ch / 4));

  const cellBuckets = new Int8Array(cells);
  let defined = 0;
  const marks: RectMark[] = [];
  const labels: TextMark[] = [];
  const fmt = spec.labelFormat ?? ((v: number) => String(Math.round(v * 100) / 100));
  const missingSlot = nb; // legend slot of missing cells
  // Keys are `x|y` labels; duplicate category labels fall back to index-qualified keys.
  const unique = new Set(xLabels).size === nx && new Set(yLabels).size === ny;
  const cellKey = (xi: number, yi: number) =>
    unique ? `${xLabels[xi]}|${yLabels[yi]}` : `${xLabels[xi]}#${xi}|${yLabels[yi]}#${yi}`;
  for (let yi = 0; yi < ny; yi++) {
    for (let xi = 0; xi < nx; xi++) {
      const cell = yi * nx + xi;
      const v = values[cell] ?? Number.NaN;
      const b = scale.bucketOf(v);
      cellBuckets[cell] = b;
      if (Number.isFinite(v)) defined++;
      const x = xs.position(xi) + gap / 2;
      const y = ys.position(yi) + gap / 2;
      marks.push({
        type: 'rect',
        key: cellKey(xi, yi),
        x,
        y,
        width: cw,
        height: ch,
        radius,
        ...heatmapCellStyle(scale, b),
        series: b >= 0 ? b : missingSlot,
        index: cell,
        enter: { opacity: 0 },
      });
      if (spec.labels && Number.isFinite(v) && b >= 0) {
        const text = fmt(v, xi, yi);
        if (estimateTextWidth(text, fontSize) + 6 <= cw && fontSize + 4 <= ch) {
          const ink = (scale.buckets[b] as HeatmapBucket).ink;
          labels.push({
            key: `lbl|${xi}|${yi}`,
            x: x + cw / 2,
            y: y + ch / 2,
            text,
            anchor: 'middle',
            baseline: 'middle',
            ...(ink.fill ? { fill: ink.fill } : { tone: 'primary' as const }),
            fontWeight: 500,
          });
        }
      }
    }
  }

  const cellRect = (cell: number): Rect | null => {
    if (!(cell >= 0 && cell < cells)) return null;
    const xi = cell % nx;
    const yi = Math.floor(cell / nx);
    return { x: xs.position(xi) + gap / 2, y: ys.position(yi) + gap / 2, width: cw, height: ch };
  };

  return {
    frame,
    columns: nx,
    rows: ny,
    scale,
    cellBuckets,
    defined,
    marks: sortHeatmapCells(marks, nb + 1),
    labels,
    radius,
    hitTest(x, y) {
      if (!cells) return -1;
      if (x < plot.x || x >= plot.x + plot.width || y < plot.y || y >= plot.y + plot.height)
        return -1;
      const xi = Math.min(nx - 1, Math.max(0, Math.floor((x - plot.x) / stepX)));
      const yi = Math.min(ny - 1, Math.max(0, Math.floor((y - plot.y) / stepY)));
      return yi * nx + xi;
    },
    cellRect,
    activeMarks(cell) {
      const r = cellRect(cell);
      if (!r) return [];
      return heatmapActiveMarks(
        r,
        heatmapCellStyle(scale, cellBuckets[cell] as number),
        String(cell),
        radius,
        Math.min(1.5, gap),
      );
    },
  };
}
