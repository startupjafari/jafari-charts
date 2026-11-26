/**
 * Downsampling for large time series. Both algorithms are O(n), keep the first
 * and last points, and return *indices* into the original arrays so tooltips and
 * hit testing can still report exact source values.
 *
 * Gaps (NaN y values) are preserved: each defined segment is downsampled on its
 * own and one gap index is kept between segments.
 */

function segments(ys: ArrayLike<number>): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let start = -1;
  for (let i = 0; i < ys.length; i++) {
    const ok = Number.isFinite(ys[i] as number);
    if (ok && start < 0) start = i;
    if (!ok && start >= 0) {
      out.push([start, i]);
      start = -1;
    }
  }
  if (start >= 0) out.push([start, ys.length]);
  return out;
}

function runSegmented(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  threshold: number,
  run: (
    xs: ArrayLike<number>,
    ys: ArrayLike<number>,
    from: number,
    to: number,
    budget: number,
    out: number[],
  ) => void,
): Uint32Array {
  const n = ys.length;
  if (threshold >= n || threshold <= 0) return Uint32Array.from({ length: n }, (_, i) => i);
  const segs = segments(ys);
  let defined = 0;
  for (const [a, b] of segs) defined += b - a;
  const out: number[] = [];
  segs.forEach(([a, b], si) => {
    if (si > 0) out.push(a - 1); // keep the gap marker
    const len = b - a;
    const budget = Math.max(2, Math.round((len / Math.max(1, defined)) * threshold));
    if (len <= budget) {
      for (let i = a; i < b; i++) out.push(i);
    } else {
      run(xs, ys, a, b, budget, out);
    }
  });
  return Uint32Array.from(out);
}

/**
 * Largest-Triangle-Three-Buckets (Steinarsson, 2013): keeps the points that best
 * preserve the visual shape of the series.
 */
export function lttb(xs: ArrayLike<number>, ys: ArrayLike<number>, threshold: number): Uint32Array {
  return runSegmented(xs, ys, threshold, (X, Y, from, to, budget, out) => {
    const len = to - from;
    const every = (len - 2) / (budget - 2);
    let a = from;
    out.push(a);
    for (let i = 0; i < budget - 2; i++) {
      let avgStart = from + Math.floor((i + 1) * every) + 1;
      let avgEnd = Math.min(from + Math.floor((i + 2) * every) + 1, to);
      if (avgStart >= avgEnd) {
        avgStart = Math.min(avgStart, to - 1);
        avgEnd = avgStart + 1;
      }
      let avgX = 0;
      let avgY = 0;
      for (let j = avgStart; j < avgEnd; j++) {
        avgX += X[j] as number;
        avgY += Y[j] as number;
      }
      const count = avgEnd - avgStart;
      avgX /= count;
      avgY /= count;

      const rangeStart = from + Math.floor(i * every) + 1;
      const rangeEnd = Math.min(from + Math.floor((i + 1) * every) + 1, to - 1);
      const ax = X[a] as number;
      const ay = Y[a] as number;
      let maxArea = -1;
      let next = rangeStart;
      for (let j = rangeStart; j < rangeEnd; j++) {
        const area = Math.abs(
          (ax - avgX) * ((Y[j] as number) - ay) - (ax - (X[j] as number)) * (avgY - ay),
        );
        if (area > maxArea) {
          maxArea = area;
          next = j;
        }
      }
      if (next !== a) out.push(next);
      a = next;
    }
    out.push(to - 1);
  });
}

/**
 * Min-max downsampling: splits the x range into `threshold / 4` buckets and keeps
 * the first, minimum, maximum and last point of each. Never loses a spike, which
 * makes it the right choice for monitoring data rendered at pixel density.
 */
export function minMaxDownsample(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  threshold: number,
): Uint32Array {
  return runSegmented(xs, ys, threshold, (X, Y, from, to, budget, out) => {
    const buckets = Math.max(1, Math.floor(budget / 4));
    const x0 = X[from] as number;
    const x1 = X[to - 1] as number;
    const span = x1 - x0 || 1;
    let bucket = -1;
    let first = -1;
    let last = -1;
    let min = -1;
    let max = -1;
    const flush = () => {
      if (first < 0) return;
      const picked = [first, min, max, last].sort((p, q) => p - q);
      let prev = -1;
      for (const p of picked) {
        if (p !== prev) out.push(p);
        prev = p;
      }
    };
    for (let i = from; i < to; i++) {
      const b = Math.min(buckets - 1, Math.floor((((X[i] as number) - x0) / span) * buckets));
      if (b !== bucket) {
        flush();
        bucket = b;
        first = last = min = max = i;
      } else {
        last = i;
        if ((Y[i] as number) < (Y[min] as number)) min = i;
        if ((Y[i] as number) > (Y[max] as number)) max = i;
      }
    }
    flush();
  });
}

export type DownsampleMethod = 'lttb' | 'minmax';

export function downsample(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  threshold: number,
  method: DownsampleMethod = 'lttb',
): Uint32Array {
  return method === 'minmax' ? minMaxDownsample(xs, ys, threshold) : lttb(xs, ys, threshold);
}
