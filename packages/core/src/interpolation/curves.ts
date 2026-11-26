import type { PathSink } from '../geometry/path';

/**
 * Curve interpolation between data points.
 * - `linear`: straight segments.
 * - `monotone`: smooth cubic that preserves monotonicity (Steffen 1990): it never
 *   overshoots, never invents local extrema, and passes through every data point,
 *   so smoothing never distorts the data.
 * - `step`: value changes half-way between points.
 * - `stepBefore`: value changes at the previous point (vertical segment first).
 * - `stepAfter`: value holds until the next point (horizontal segment first).
 */
export type CurveType = 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';

export const CURVES: readonly CurveType[] = [
  'linear',
  'monotone',
  'step',
  'stepBefore',
  'stepAfter',
];

/**
 * Draws a curve through the points. When `connect` is true the first point is
 * joined with `lineTo` (continuing an existing subpath) instead of `moveTo`.
 */
export function drawCurve(
  sink: PathSink,
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  curve: CurveType = 'linear',
  connect = false,
): void {
  const n = Math.min(xs.length, ys.length);
  if (n === 0) return;
  const x0 = xs[0] as number;
  const y0 = ys[0] as number;
  if (connect) sink.lineTo(x0, y0);
  else sink.moveTo(x0, y0);
  if (n === 1) return;
  switch (curve) {
    case 'monotone':
      if (n > 2) {
        monotone(sink, xs, ys, n);
        return;
      }
      sink.lineTo(xs[1] as number, ys[1] as number);
      return;
    case 'step':
    case 'stepBefore':
    case 'stepAfter':
      step(sink, xs, ys, n, curve === 'step' ? 0.5 : curve === 'stepBefore' ? 0 : 1);
      return;
    default:
      for (let i = 1; i < n; i++) sink.lineTo(xs[i] as number, ys[i] as number);
  }
}

function step(
  sink: PathSink,
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  n: number,
  t: number,
): void {
  let px = xs[0] as number;
  let py = ys[0] as number;
  for (let i = 1; i < n; i++) {
    const x = xs[i] as number;
    const y = ys[i] as number;
    if (t <= 0) {
      sink.lineTo(px, y);
    } else if (t >= 1) {
      sink.lineTo(x, py);
    } else {
      const mx = px + (x - px) * t;
      sink.lineTo(mx, py);
      sink.lineTo(mx, y);
    }
    sink.lineTo(x, y);
    px = x;
    py = y;
  }
}

function sign(v: number): number {
  return v < 0 ? -1 : 1;
}

/** Steffen tangent at the interior point between segments (h0, s0) and (h1, s1). */
function tangent(h0: number, s0: number, h1: number, s1: number): number {
  if (h0 === 0 || h1 === 0) return 0;
  const p = (s0 * h1 + s1 * h0) / (h0 + h1);
  const t = (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p));
  return Number.isFinite(t) ? t : 0;
}

function monotone(sink: PathSink, xs: ArrayLike<number>, ys: ArrayLike<number>, n: number): void {
  const slope = (i: number) => {
    const h = (xs[i + 1] as number) - (xs[i] as number);
    return h === 0 ? 0 : ((ys[i + 1] as number) - (ys[i] as number)) / h;
  };
  const width = (i: number) => (xs[i + 1] as number) - (xs[i] as number);

  // Tangents: interior via Steffen, endpoints via one-sided parabola.
  const t = new Float64Array(n);
  for (let i = 1; i < n - 1; i++) t[i] = tangent(width(i - 1), slope(i - 1), width(i), slope(i));
  const endTangent = (s: number, inner: number) => {
    const v = (3 * s - inner) / 2;
    // Keep the end segment monotone too: |t| ≤ 2|s| on both ends satisfies the
    // Fritsch–Carlson condition α² + β² ≤ 9, so the curve cannot overshoot.
    return sign(v) !== sign(s) || s === 0 ? 0 : Math.abs(v) > 2 * Math.abs(s) ? 2 * s : v;
  };
  t[0] = endTangent(slope(0), t[1] as number);
  t[n - 1] = endTangent(slope(n - 2), t[n - 2] as number);

  for (let i = 0; i < n - 1; i++) {
    const x0 = xs[i] as number;
    const y0 = ys[i] as number;
    const x1 = xs[i + 1] as number;
    const y1 = ys[i + 1] as number;
    const dx = (x1 - x0) / 3;
    sink.bezierCurveTo(
      x0 + dx,
      y0 + (t[i] as number) * dx,
      x1 - dx,
      y1 - (t[i + 1] as number) * dx,
      x1,
      y1,
    );
  }
}

/** The curve to use when tracing points in reverse (e.g. an area's baseline). */
export function reverseCurve(curve: CurveType): CurveType {
  if (curve === 'stepAfter') return 'stepBefore';
  if (curve === 'stepBefore') return 'stepAfter';
  return curve;
}
