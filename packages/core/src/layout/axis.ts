import { createTickFormat } from '../formatting/number';
import { estimateTextWidth, truncateText } from '../formatting/text';
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
    const values = scale.ticks(count);
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
): void {
  for (const t of ticks) {
    const half = estimateTextWidth(t.label, fontSize) / 2;
    if (t.position - half < bounds[0]) t.anchor = 'start';
    else if (t.position + half > bounds[1]) t.anchor = 'end';
  }
}

export interface BandTickOptions {
  scale: BandScale;
  direction: 'x' | 'y';
  format?: (label: string, index: number) => string;
  fontSize?: number;
  minGap?: number;
  /** Longest a label may be before it is truncated with an ellipsis, px. */
  maxLabelWidth?: number;
  bounds?: readonly [number, number];
}

/**
 * Category ticks: every band is labelled when there is room, otherwise every k-th
 * band, and labels are truncated to the space available.
 */
export function bandTicks(options: BandTickOptions): AxisTick[] {
  const { scale, direction, fontSize = 11, minGap = direction === 'x' ? 8 : 2 } = options;
  const n = scale.domain.length;
  if (n === 0) return [];
  const labels = scale.domain.map((l, i) => (options.format ? options.format(l, i) : l));
  const step = Math.max(1e-6, scale.step);
  let every: number;
  let maxWidth = options.maxLabelWidth ?? (direction === 'x' ? 140 : 120);
  if (direction === 'x') {
    let widest = 0;
    for (const l of labels) widest = Math.max(widest, estimateTextWidth(l, fontSize));
    widest = Math.min(maxWidth, widest);
    every = Math.max(1, Math.ceil((widest + minGap) / step));
    maxWidth = Math.min(maxWidth, every * step - minGap);
  } else {
    every = Math.max(1, Math.ceil((fontSize * 1.25 + minGap) / step));
  }
  const ticks: AxisTick[] = [];
  for (let i = 0; i < n; i += every) {
    const position = scale.center(i);
    ticks.push({
      value: i,
      index: i,
      position,
      label: truncateText(labels[i] as string, Math.max(0, maxWidth), fontSize),
      anchor: 'middle',
    });
  }
  if (direction === 'x' && options.bounds) anchorEdges(ticks, options.bounds, fontSize);
  return ticks;
}

/** Widest estimated label among ticks (for margin computation). */
export function maxLabelWidth(ticks: readonly AxisTick[], fontSize = 11): number {
  let w = 0;
  for (const t of ticks) w = Math.max(w, estimateTextWidth(t.label, fontSize));
  return w;
}
