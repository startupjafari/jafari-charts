/**
 * Stacking offsets:
 * - `zero`: values accumulate from zero in series order (negatives subtract).
 * - `diverging`: positives stack upwards and negatives downwards from zero, so
 *   mixed-sign data never overlaps (default for bars).
 * - `expand`: like diverging, but each column is normalised so the magnitudes sum
 *   to 1 (percentage stacking).
 */
export type StackOffset = 'zero' | 'diverging' | 'expand';

export interface StackResult {
  /** Lower bound of each series per index. */
  y0: Float64Array[];
  /** Upper bound of each series per index. */
  y1: Float64Array[];
}

/**
 * Stacks columnar series. Missing values (NaN) contribute zero height but keep
 * their position, so the stack never shifts when a value is absent.
 */
export function stack(
  series: readonly ArrayLike<number>[],
  offset: StackOffset = 'diverging',
): StackResult {
  const m = series.length;
  const n = m === 0 ? 0 : Math.max(...series.map((s) => s.length));
  const y0 = series.map(() => new Float64Array(n));
  const y1 = series.map(() => new Float64Array(n));
  for (let i = 0; i < n; i++) {
    let pos = 0;
    let neg = 0;
    let total = 0;
    if (offset === 'expand') {
      for (let s = 0; s < m; s++) {
        const v = (series[s] as ArrayLike<number>)[i] as number;
        if (Number.isFinite(v)) total += Math.abs(v);
      }
    }
    const k = offset === 'expand' ? (total > 0 ? 1 / total : 0) : 1;
    for (let s = 0; s < m; s++) {
      const raw = (series[s] as ArrayLike<number>)[i] as number;
      const v = Number.isFinite(raw) ? raw * k : 0;
      const lo = y0[s] as Float64Array;
      const hi = y1[s] as Float64Array;
      if (offset === 'zero') {
        lo[i] = pos;
        hi[i] = pos += v;
      } else if (v >= 0) {
        lo[i] = pos;
        hi[i] = pos += v;
      } else {
        hi[i] = neg;
        lo[i] = neg += v;
      }
    }
  }
  return { y0, y1 };
}

/** Converts values to their share of the column total (0–1). Totals of zero yield zeros. */
export function toShares(values: ArrayLike<number>): Float64Array {
  const out = new Float64Array(values.length);
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] as number;
    if (Number.isFinite(v) && v > 0) total += v;
  }
  if (total === 0) return out;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] as number;
    out[i] = Number.isFinite(v) && v > 0 ? v / total : 0;
  }
  return out;
}

export function sum(values: ArrayLike<number>): number {
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] as number;
    if (Number.isFinite(v)) total += v;
  }
  return total;
}
