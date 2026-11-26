export type WaterfallKind = 'start' | 'delta' | 'total';

export interface WaterfallResult {
  /** Lower end of each floating bar. */
  base: Float64Array;
  /** Upper end (in data order, not min/max) of each bar: the running total after the step. */
  top: Float64Array;
  /** Value to display for each step (the change, or the total for total bars). */
  display: Float64Array;
  /** +1 increase, -1 decrease, 0 start/total. */
  direction: Int8Array;
}

/**
 * Running totals for a waterfall chart. `start` bars begin at zero, `delta`
 * bars float from the running total, `total` bars show the running total so far
 * (their own value is ignored). Missing deltas are treated as zero change.
 */
export function computeWaterfall(
  values: ArrayLike<number>,
  kinds: readonly WaterfallKind[],
): WaterfallResult {
  const n = values.length;
  const base = new Float64Array(n);
  const top = new Float64Array(n);
  const display = new Float64Array(n);
  const direction = new Int8Array(n);
  let running = 0;
  for (let i = 0; i < n; i++) {
    const raw = values[i] as number;
    const v = Number.isFinite(raw) ? raw : 0;
    const kind = kinds[i] ?? 'delta';
    if (kind === 'start') {
      running = v;
      base[i] = 0;
      top[i] = v;
      display[i] = v;
    } else if (kind === 'total') {
      base[i] = 0;
      top[i] = running;
      display[i] = running;
    } else {
      base[i] = running;
      running += v;
      top[i] = running;
      display[i] = v;
      direction[i] = v > 0 ? 1 : v < 0 ? -1 : 0;
    }
  }
  return { base, top, display, direction };
}
