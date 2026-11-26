/** First index `i` such that `values[i] >= x` in an ascending array. */
export function bisectLeft(
  values: ArrayLike<number>,
  x: number,
  lo = 0,
  hi = values.length,
): number {
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if ((values[mid] as number) < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** First index `i` such that `values[i] > x` in an ascending array. */
export function bisectRight(
  values: ArrayLike<number>,
  x: number,
  lo = 0,
  hi = values.length,
): number {
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if ((values[mid] as number) <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Index of the value closest to `x` in an ascending array, in O(log n).
 * Returns -1 for an empty array. Ties resolve to the earlier index.
 */
export function nearestIndex(values: ArrayLike<number>, x: number): number {
  const n = values.length;
  if (n === 0 || Number.isNaN(x)) return -1;
  const i = bisectLeft(values, x);
  if (i <= 0) return 0;
  if (i >= n) return n - 1;
  const before = values[i - 1] as number;
  const after = values[i] as number;
  return x - before <= after - x ? i - 1 : i;
}

/** `[min, max]` of the finite values, or `[NaN, NaN]` when there are none. */
export function extent(values: ArrayLike<number>): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] as number;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return min <= max ? [min, max] : [Number.NaN, Number.NaN];
}

/** Combined extent of several columns. */
export function extentOf(columns: readonly ArrayLike<number>[]): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const c of columns) {
    const [lo, hi] = extent(c);
    if (lo < min) min = lo;
    if (hi > max) max = hi;
  }
  return min <= max ? [min, max] : [Number.NaN, Number.NaN];
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}
