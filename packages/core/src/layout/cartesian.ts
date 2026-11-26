import { niceDomain } from '../scales/ticks';
import { createBandScale, createPointScale, isBandScale, type BandScale } from '../scales/band';
import { createLinearScale, type LinearScale } from '../scales/linear';
import { createLogScale, type LogScale } from '../scales/log';
import { createTimeScale, type TimeScale } from '../scales/time';
import type { Extent, Margins, Rect } from '../types';
import { bandTicks, continuousTicks, maxLabelWidth, type AxisTick } from './axis';

export interface ValueDomainOptions {
  /**
   * Include zero in the domain. `'auto'` includes it when all values share a sign
   * and zero is reasonably close (min ≤ 25% of max), as in count data.
   */
  includeZero?: boolean | 'auto';
  /** Round the domain to tick-friendly bounds (default true). */
  nice?: boolean;
  /** Fixed lower bound (overrides the data). */
  min?: number;
  /** Fixed upper bound (overrides the data). */
  max?: number;
  /** Logarithmic domains never include zero and are padded to powers of ten. */
  log?: boolean;
}

/**
 * Turns a data extent into a display domain. Handles empty data, all-equal
 * values, all-zero values and mixed signs without ever producing a zero span.
 */
export function resolveValueDomain(
  extent: Extent,
  options: ValueDomainOptions = {},
): [number, number] {
  const { includeZero = true, nice = true, log = false } = options;
  let [lo, hi] = extent;
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    lo = log ? 1 : 0;
    hi = log ? 10 : 1;
  }
  if (log) {
    if (lo <= 0) lo = hi > 0 ? Math.min(hi, 1) / 10 : 1;
    if (hi <= lo) hi = lo * 10;
  } else {
    const zero =
      includeZero === true ||
      (includeZero === 'auto' && ((lo >= 0 && lo <= hi * 0.25) || (hi <= 0 && hi >= lo * 0.25)));
    if (zero) {
      lo = Math.min(lo, 0);
      hi = Math.max(hi, 0);
    }
    if (lo === hi) {
      if (lo === 0) hi = 1;
      else {
        const pad = Math.abs(lo) * 0.1 || 1;
        lo -= pad;
        hi += pad;
      }
    }
  }
  if (options.min !== undefined && Number.isFinite(options.min)) lo = options.min;
  if (options.max !== undefined && Number.isFinite(options.max)) hi = options.max;
  if (hi < lo) [lo, hi] = [hi, lo];
  if (lo === hi) hi = lo + 1;
  if (nice && !log) {
    const [nLo, nHi] = niceDomain([lo, hi], 5);
    lo = options.min !== undefined ? lo : nLo;
    hi = options.max !== undefined ? hi : nHi;
  }
  return [lo, hi];
}

export type AxisSpec =
  | {
      kind: 'linear' | 'log';
      domain: Extent;
      format?: (value: number) => string;
      tickCount?: number;
      hidden?: boolean;
    }
  | {
      kind: 'time';
      domain: Extent;
      utc?: boolean;
      format?: (value: number) => string;
      tickCount?: number;
      hidden?: boolean;
    }
  | {
      kind: 'band' | 'point';
      labels: readonly string[];
      paddingInner?: number;
      paddingOuter?: number;
      format?: (label: string, index: number) => string;
      hidden?: boolean;
      maxLabelWidth?: number;
    };

export type AnyScale = LinearScale | LogScale | TimeScale | BandScale;

export interface FrameOptions {
  width: number;
  height: number;
  x: AxisSpec;
  y: AxisSpec;
  /** Optional secondary value axis on the right. */
  y2?: AxisSpec;
  /** Space around the plot in addition to axis labels. */
  padding?: Partial<Margins>;
  fontSize?: number;
  locale?: string;
  /** Distance between tick labels and the plot, px. */
  tickPadding?: number;
}

export interface CartesianFrame {
  width: number;
  height: number;
  plot: Rect;
  x: AnyScale;
  y: AnyScale;
  y2: LinearScale | LogScale | null;
  xTicks: AxisTick[];
  yTicks: AxisTick[];
  y2Ticks: AxisTick[];
}

const DEFAULT_PADDING: Margins = { top: 10, right: 12, bottom: 4, left: 4 };

function makeScale(spec: AxisSpec, range: Extent): AnyScale {
  switch (spec.kind) {
    case 'linear':
      return createLinearScale({ domain: spec.domain, range });
    case 'log':
      return createLogScale({ domain: spec.domain, range });
    case 'time':
      return createTimeScale({ domain: spec.domain, range, utc: spec.utc ?? false });
    case 'band':
      return createBandScale({
        domain: spec.labels,
        range,
        paddingInner: spec.paddingInner ?? 0.28,
        paddingOuter: spec.paddingOuter ?? 0.14,
      });
    case 'point':
      return createPointScale({ domain: spec.labels, range, padding: spec.paddingOuter ?? 0.5 });
  }
}

function ticksFor(
  spec: AxisSpec,
  scale: AnyScale,
  direction: 'x' | 'y',
  fontSize: number,
  locale: string,
  bounds: readonly [number, number] | undefined,
  maxBandLabel: number,
): AxisTick[] {
  if (spec.hidden && direction === 'x') return [];
  if (isBandScale(scale)) {
    const s = spec as Extract<AxisSpec, { kind: 'band' | 'point' }>;
    return bandTicks({
      scale,
      direction,
      fontSize,
      ...(s.format ? { format: s.format } : {}),
      maxLabelWidth: s.maxLabelWidth ?? maxBandLabel,
      ...(bounds ? { bounds } : {}),
    });
  }
  const s = spec as Exclude<AxisSpec, { kind: 'band' | 'point' }>;
  return continuousTicks({
    scale,
    direction,
    fontSize,
    locale,
    ...(s.format ? { format: s.format } : {}),
    ...(s.tickCount !== undefined ? { count: s.tickCount } : {}),
    ...(bounds ? { bounds } : {}),
  });
}

/**
 * Computes the plot rectangle, scales and axis ticks of a cartesian chart.
 * Order: x label band → y ticks (needs plot height) → left margin from the widest
 * y label → x ticks (needs plot width). No step depends on a later one, so the
 * layout is computed in a single pass and is fully deterministic.
 */
export function computeCartesianFrame(options: FrameOptions): CartesianFrame {
  const { width, height, fontSize = 11, locale = 'en', tickPadding = 8 } = options;
  const pad = { ...DEFAULT_PADDING, ...options.padding };
  const yIsBand = options.y.kind === 'band' || options.y.kind === 'point';

  const bottom = pad.bottom + (options.x.hidden ? 0 : Math.ceil(fontSize * 1.2) + tickPadding);
  const top = pad.top;
  const plotBottom = Math.max(top, height - bottom);

  // Value axes run bottom→top; category axes run top→bottom (first category first).
  const yRange: Extent = yIsBand ? [top, plotBottom] : [plotBottom, top];
  const y = makeScale(options.y, yRange);
  const yTicks = options.y.hidden
    ? []
    : ticksFor(options.y, y, 'y', fontSize, locale, undefined, Math.max(40, width * 0.32));
  const yHiddenTicks = options.y.hidden
    ? ticksFor({ ...options.y, hidden: false }, y, 'y', fontSize, locale, undefined, 0)
    : yTicks;

  let y2: LinearScale | LogScale | null = null;
  let y2Ticks: AxisTick[] = [];
  if (options.y2 && (options.y2.kind === 'linear' || options.y2.kind === 'log')) {
    y2 = makeScale(options.y2, [plotBottom, top]) as LinearScale | LogScale;
    y2Ticks = options.y2.hidden
      ? []
      : ticksFor(options.y2, y2, 'y', fontSize, locale, undefined, 0);
  }

  const left =
    pad.left + (options.y.hidden ? 0 : Math.ceil(maxLabelWidth(yTicks, fontSize)) + tickPadding);
  const right =
    pad.right + (y2Ticks.length ? Math.ceil(maxLabelWidth(y2Ticks, fontSize)) + tickPadding : 0);
  const plotRight = Math.max(left, width - right);

  const x = makeScale(options.x, [left, plotRight]);
  const xTicks = ticksFor(options.x, x, 'x', fontSize, locale, [0, width], 140);

  return {
    width,
    height,
    plot: { x: left, y: top, width: plotRight - left, height: plotBottom - top },
    x,
    y,
    y2,
    xTicks,
    // Hidden axes still expose tick positions for gridlines.
    yTicks: options.y.hidden ? yHiddenTicks : yTicks,
    y2Ticks,
  };
}

/** Pixel position for a value on any scale (band scales use the band centre). */
export function scalePosition(scale: AnyScale, value: number): number {
  if (isBandScale(scale)) return scale.center(value);
  return scale.map(value);
}

/** Pixel of the zero baseline on a value scale, clamped to the plot. */
export function baselinePosition(scale: LinearScale | LogScale): number {
  const [r0, r1] = scale.range;
  const lo = Math.min(r0, r1);
  const hi = Math.max(r0, r1);
  if (scale.kind === 'log') return r0; // log scales have no zero: bars grow from the domain start
  const z = scale.map(0);
  return Math.min(hi, Math.max(lo, z));
}
