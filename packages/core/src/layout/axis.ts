import { createTickFormat } from '../formatting/number';
import { estimateTextWidth, wrapText } from '../formatting/text';
import type { BandScale } from '../scales/band';
import type { LinearScale } from '../scales/linear';
import type { LogScale } from '../scales/log';
import type { TimeScale } from '../scales/time';

export interface AxisTick {
  value: number;
  /** Pixel position along the axis. */
  position: number;
  label: string;
  /** Text anchor adjusted so edge labels stay inside the chart. */
  anchor: 'start' | 'middle' | 'end';
  /** Category index for band/point axes. */
  index?: number;
  /** A label wrapped onto several lines (`label` holds them joined by spaces). */
  lines?: string[];
}

/** Line height of wrapped tick labels, em. */
export const LABEL_LINE_HEIGHT = 1.2;

/** Estimated width of a tick label (its widest line when wrapped). */
export function tickLabelWidth(tick: AxisTick, fontSize = 11): number {
  return Math.max(...(tick.lines ?? [tick.label]).map((l) => estimateTextWidth(l, fontSize)));
}

export type ContinuousScale = LinearScale | LogScale | TimeScale;

export interface ContinuousTickOptions {
  scale: ContinuousScale;
  /** Axis direction: x ticks are spaced by label width, y ticks by line height. */
  direction: 'x' | 'y';
  locale?: string;
  format?: (value: number) => string;
  /** Desired tick count; derived from the axis length when omitted. */
  count?: number;
  fontSize?: number;
  /** Minimum free space between neighbouring labels, px. */
  minGap?: number;
  /** Horizontal extent the labels must stay within (x axes), e.g. [0, svgWidth]. */
  bounds?: readonly [number, number];
  /** Whole-number ticks only (counts); log axes keep their whole powers. Ignored for time. */
  integer?: boolean;
}

/**
 * Tick values; whole numbers only for `integer` axes: a linear axis asks for at most one
 * tick per unit, so its nice step is never below 1 (0–2 → 0, 1, 2).
 */
function tickValues(scale: ContinuousScale, count: number, integer: boolean): number[] {
  if (!integer || scale.kind === 'time') return scale.ticks(count);
  const span = Math.floor(Math.abs(scale.domain[1] - scale.domain[0]));
  return scale
    .ticks(scale.kind === 'linear' ? Math.max(1, Math.min(count, span)) : count)
    .filter(Number.isInteger);
}

function formatterFor(
  scale: ContinuousScale,
  ticks: number[],
  count: number,
  locale: string,
): (v: number) => string {
  if (scale.kind === 'time') return scale.tickFormat(count, locale);
  return createTickFormat(ticks, locale);
}

/**
 * Picks tick values for a continuous axis so labels never overlap: starts from a
 * density-based count and decreases it until the widest label fits.
 */
export function continuousTicks(options: ContinuousTickOptions): AxisTick[] {
  const {
    scale,
    direction,
    locale = 'en',
    fontSize = 11,
    minGap = direction === 'x' ? 12 : 4,
  } = options;
  const [r0, r1] = scale.range;
  const length = Math.abs(r1 - r0);
  if (length <= 0) return [];
  const spacing = direction === 'x' ? 80 : 44;
  let count =
    options.count ??
    Math.max(2, Math.min(direction === 'x' ? 12 : 10, Math.floor(length / spacing) + 1));

  let best: AxisTick[] = [];
  for (let attempt = 0; attempt < 6; attempt++) {
    const values = tickValues(scale, count, options.integer ?? false);
    const fmt = options.format ?? formatterFor(scale, values, count, locale);
    const ticks: AxisTick[] = values
      .map((value) => ({
        value,
        position: scale.map(value),
        label: fmt(value),
        anchor: 'middle' as const,
      }))
      .filter((t) => Number.isFinite(t.position));
    best = ticks;
    if (ticks.length < 2 || options.count !== undefined) break;
    let fits = true;
    for (let i = 1; i < ticks.length; i++) {
      const a = ticks[i - 1] as AxisTick;
      const b = ticks[i] as AxisTick;
      const distance = Math.abs(b.position - a.position);
      const need =
        direction === 'x'
          ? (estimateTextWidth(a.label, fontSize) + estimateTextWidth(b.label, fontSize)) / 2 +
            minGap
          : fontSize + minGap;
      if (distance < need) {
        fits = false;
        break;
      }
    }
    if (fits || count <= 2) break;
    count = Math.max(2, Math.floor(count * 0.66));
  }
  if (direction === 'x' && options.bounds) anchorEdges(best, options.bounds, fontSize);
  return best;
}

/** Switches edge labels to start/end anchoring when centring would overflow. */
export function anchorEdges(
  ticks: AxisTick[],
  bounds: readonly [number, number],
  fontSize = 11,
  minGap = 8,
): void {
  for (const t of ticks) {
    const half = tickLabelWidth(t, fontSize) / 2;
    if (t.position - half < bounds[0]) t.anchor = 'start';
    else if (t.position + half > bounds[1]) t.anchor = 'end';
  }
  // An edge label shifted inwards can now collide with its neighbour (spacing was
  // checked for centred labels): drop the neighbour rather than overlap.
  const span = (t: AxisTick): [number, number] => {
    const w = tickLabelWidth(t, fontSize);
    if (t.anchor === 'start') return [t.position, t.position + w];
    if (t.anchor === 'end') return [t.position - w, t.position];
    return [t.position - w / 2, t.position + w / 2];
  };
  if (ticks.length > 2) {
    const last = ticks[ticks.length - 1] as AxisTick;
    const prev = ticks[ticks.length - 2] as AxisTick;
    if (last.anchor === 'end' && span(prev)[1] + minGap > span(last)[0])
      ticks.splice(ticks.length - 2, 1);
  }
  if (ticks.length > 2) {
    const first = ticks[0] as AxisTick;
    const next = ticks[1] as AxisTick;
    if (first.anchor === 'start' && span(first)[1] + minGap > span(next)[0]) ticks.splice(1, 1);
  }
}

export interface BandTickOptions {
  scale: BandScale;
  direction: 'x' | 'y';
  format?: (label: string, index: number) => string;
  fontSize?: number;
  minGap?: number;
  /** Longest a label (line) may be before it is wrapped or truncated with an ellipsis, px. */
  maxLabelWidth?: number;
  /**
   * Wrap long labels at word boundaries onto up to this many lines (default 1: truncate).
   * y axes wrap when the band step fits the lines; x axes when every category can keep its
   * label (no thinning), i.e. when the first word of every label fits a category.
   */
  maxLines?: number;
  bounds?: readonly [number, number];
}

/**
 * Category ticks: every band is labelled when there is room, otherwise every k-th
 * band, and labels are wrapped or truncated to the space available.
 */
export function bandTicks(options: BandTickOptions): AxisTick[] {
  const { scale, direction, fontSize = 11, minGap = direction === 'x' ? 8 : 2 } = options;
  const n = scale.domain.length;
  if (n === 0) return [];
  const labels = scale.domain.map((l, i) => (options.format ? options.format(l, i) : l));
  const step = Math.max(1e-6, scale.step);
  const maxLines = Math.max(1, Math.floor(options.maxLines ?? 1));
  let every: number;
  let lines = 1;
  let maxWidth = options.maxLabelWidth ?? (direction === 'x' ? 140 : 120);
  if (direction === 'x') {
    let widest = 0;
    for (const l of labels) widest = Math.max(widest, estimateTextWidth(l, fontSize));
    widest = Math.min(maxWidth, widest);
    every = Math.max(1, Math.ceil((widest + minGap) / step));
    const lineWidth = Math.min(maxWidth, step - minGap);
    // Wrapping keeps a label under every category: always when none is skipped anyway,
    // otherwise when every label starts with whole words (its first word fits; the end of a
    // long label may still be dropped). Single words that do not fit are thinned instead.
    if (
      maxLines > 1 &&
      (every === 1 ||
        (lineWidth > 0 &&
          labels.every((l) => wrapText(l, lineWidth, maxLines, fontSize).cut !== 0)))
    ) {
      every = 1;
      lines = maxLines;
      maxWidth = lineWidth;
    } else maxWidth = Math.min(maxWidth, every * step - minGap);
  } else {
    every = Math.max(1, Math.ceil((fontSize * 1.25 + minGap) / step));
    if (every === 1)
      lines = Math.max(
        1,
        Math.min(maxLines, Math.floor((step - minGap) / (fontSize * LABEL_LINE_HEIGHT))),
      );
  }
  maxWidth = Math.max(0, maxWidth);
  // Shortened lines fill their whole width: on wrapped x labels they stop `minGap` short to
  // keep neighbouring labels apart.
  const cutWidth = direction === 'x' && lines > 1 ? maxWidth - minGap : maxWidth;
  const ticks: AxisTick[] = [];
  for (let i = 0; i < n; i += every) {
    const wrapped = wrapText(labels[i] as string, maxWidth, lines, fontSize, cutWidth).lines;
    ticks.push({
      value: i,
      index: i,
      position: scale.center(i),
      label: wrapped.join(' '),
      anchor: 'middle',
      ...(wrapped.length > 1 ? { lines: wrapped } : {}),
    });
  }
  if (direction === 'x' && options.bounds) anchorEdges(ticks, options.bounds, fontSize);
  return ticks;
}

/** Widest estimated label among ticks (for margin computation). */
export function maxLabelWidth(ticks: readonly AxisTick[], fontSize = 11): number {
  let w = 0;
  for (const t of ticks) w = Math.max(w, tickLabelWidth(t, fontSize));
  return w;
}
