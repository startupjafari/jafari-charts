import { drawCurve, reverseCurve, type CurveType } from '../interpolation/curves';
import type { PathSink } from './path';

const HALF_PI = Math.PI / 2;
const TAU = Math.PI * 2;
const EPS = 1e-9;

/** Indices `[start, end)` of consecutive points where both coordinates are finite. */
export function definedRuns(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  ys2?: ArrayLike<number>,
): Array<[number, number]> {
  const runs: Array<[number, number]> = [];
  const n = Math.min(xs.length, ys.length);
  let start = -1;
  for (let i = 0; i < n; i++) {
    const ok =
      Number.isFinite(xs[i] as number) &&
      Number.isFinite(ys[i] as number) &&
      (!ys2 || Number.isFinite(ys2[i] as number));
    if (ok && start < 0) start = i;
    else if (!ok && start >= 0) {
      runs.push([start, i]);
      start = -1;
    }
  }
  if (start >= 0) runs.push([start, n]);
  return runs;
}

function slice(values: ArrayLike<number>, a: number, b: number): ArrayLike<number> {
  if (values instanceof Float64Array || values instanceof Float32Array)
    return values.subarray(a, b);
  return Array.prototype.slice.call(values, a, b) as number[];
}

function reversedSlice(values: ArrayLike<number>, a: number, b: number): Float64Array {
  const out = new Float64Array(b - a);
  for (let i = 0; i < out.length; i++) out[i] = values[b - 1 - i] as number;
  return out;
}

/** Draws a polyline/curve; missing (NaN) values split it into separate subpaths. */
export function drawLine(
  sink: PathSink,
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  curve: CurveType = 'linear',
): void {
  for (const [a, b] of definedRuns(xs, ys))
    drawCurve(sink, slice(xs, a, b), slice(ys, a, b), curve);
}

/**
 * Draws a filled area between `y1s` (top) and `y0s` (baseline). The baseline may
 * be a constant. Gaps split the area into separate closed shapes.
 */
export function drawArea(
  sink: PathSink,
  xs: ArrayLike<number>,
  y1s: ArrayLike<number>,
  y0s: ArrayLike<number> | number,
  curve: CurveType = 'linear',
): void {
  const base = typeof y0s === 'number' ? null : y0s;
  for (const [a, b] of definedRuns(xs, y1s, base ?? undefined)) {
    drawCurve(sink, slice(xs, a, b), slice(y1s, a, b), curve);
    if (base) {
      drawCurve(
        sink,
        reversedSlice(xs, a, b),
        reversedSlice(base, a, b),
        reverseCurve(curve),
        true,
      );
    } else {
      sink.lineTo(xs[b - 1] as number, y0s as number);
      sink.lineTo(xs[a] as number, y0s as number);
    }
    sink.closePath();
  }
}

/** Corner radii: top-left, top-right, bottom-right, bottom-left. */
export type CornerRadii = readonly [number, number, number, number];

/** Rectangle with independently rounded corners (radii are clamped to fit). */
export function drawRoundedRect(
  sink: PathSink,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | CornerRadii = 0,
): void {
  if (width < 0) {
    x += width;
    width = -width;
  }
  if (height < 0) {
    y += height;
    height = -height;
  }
  const max = Math.min(width, height) / 2;
  const [tl, tr, br, bl] = (
    typeof radius === 'number' ? [radius, radius, radius, radius] : radius
  ).map((r) => Math.max(0, Math.min(r, max))) as [number, number, number, number];
  if (tl + tr + br + bl < EPS) {
    sink.moveTo(x, y);
    sink.lineTo(x + width, y);
    sink.lineTo(x + width, y + height);
    sink.lineTo(x, y + height);
    sink.closePath();
    return;
  }
  sink.moveTo(x + tl, y);
  sink.lineTo(x + width - tr, y);
  if (tr > 0) sink.arc(x + width - tr, y + tr, tr, -HALF_PI, 0);
  sink.lineTo(x + width, y + height - br);
  if (br > 0) sink.arc(x + width - br, y + height - br, br, 0, HALF_PI);
  sink.lineTo(x + bl, y + height);
  if (bl > 0) sink.arc(x + bl, y + height - bl, bl, HALF_PI, Math.PI);
  sink.lineTo(x, y + tl);
  if (tl > 0) sink.arc(x + tl, y + tl, tl, Math.PI, Math.PI + HALF_PI);
  sink.closePath();
}

export interface ArcSpec {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  /** Chart angle in radians: 0 at 12 o'clock, increasing clockwise. */
  startAngle: number;
  endAngle: number;
  /** Corner rounding, px. Clamped so corners never overlap. */
  cornerRadius?: number;
  /** Constant-width gap between neighbouring sectors, px (split across both sides). */
  padding?: number;
}

/** Converts a chart angle (0 = 12 o'clock, clockwise) to a canvas angle (0 = 3 o'clock). */
export function toCanvasAngle(angle: number): number {
  return angle - HALF_PI;
}

/** Point on a circle at a chart angle. */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): { x: number; y: number } {
  const a = toCanvasAngle(angle);
  return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
}

interface Corner {
  /** Corner circle centre (relative to arc centre). */
  cx: number;
  cy: number;
  /** Tangent point on the straight edge. */
  ex: number;
  ey: number;
  /** Angle (canvas) of the tangent point on the arc. */
  arcAngle: number;
}

/**
 * Corner circle tangent to the edge line {p : n·p = h} (n = unit normal pointing
 * into the sector) and to the circle of radius `radius` around the origin.
 */
function corner(
  theta: number,
  normalSign: 1 | -1,
  h: number,
  rc: number,
  radius: number,
  outer: boolean,
): Corner | null {
  const ux = Math.cos(theta);
  const uy = Math.sin(theta);
  const nx = -uy * normalSign;
  const ny = ux * normalSign;
  const dist = outer ? radius - rc : radius + rc;
  const off = h + rc;
  const a2 = dist * dist - off * off;
  if (a2 < 0) return null;
  const a = Math.sqrt(a2);
  const cx = a * ux + off * nx;
  const cy = a * uy + off * ny;
  return { cx, cy, ex: a * ux + h * nx, ey: a * uy + h * ny, arcAngle: Math.atan2(cy, cx) };
}

/** Annular sector (pie/donut slice, gauge band) with rounded corners and gaps. */
export function drawArc(sink: PathSink, spec: ArcSpec): void {
  const { cx, cy } = spec;
  const r1 = Math.max(spec.outerRadius, spec.innerRadius, 0);
  const r0 = Math.max(Math.min(spec.innerRadius, spec.outerRadius), 0);
  let a0 = Math.min(spec.startAngle, spec.endAngle);
  let a1 = Math.max(spec.startAngle, spec.endAngle);
  const sweep = a1 - a0;
  if (r1 < EPS || sweep < EPS) return;

  const pad = Math.max(0, spec.padding ?? 0);
  if (sweep >= TAU - EPS) {
    // Full ring: outer circle clockwise, inner circle counter-clockwise (nonzero fill).
    sink.moveTo(cx + r1, cy);
    sink.arc(cx, cy, r1, 0, TAU);
    sink.closePath();
    if (r0 > EPS) {
      sink.moveTo(cx + r0, cy);
      sink.arc(cx, cy, r0, TAU, 0, true);
      sink.closePath();
    }
    return;
  }

  const h = pad / 2;
  // Edges are lines parallel to the radial at a distance h, so gaps stay constant width.
  const s = toCanvasAngle(a0);
  const e = toCanvasAngle(a1);
  // Angular half-padding at each radius.
  const padAt = (r: number) => (r > h ? Math.asin(h / r) : HALF_PI);
  if (2 * padAt(r1) >= sweep) return; // sector swallowed by the gap
  a0 = s;
  a1 = e;

  let rc = Math.max(0, Math.min(spec.cornerRadius ?? 0, (r1 - r0) / 2));
  // Corners fit when the angle they consume at both ends stays within the sweep.
  const fits = (c0: Corner | null, c1: Corner | null) =>
    c0 !== null &&
    c1 !== null &&
    angleBetween(a0, c0.arcAngle) + angleBetween(c1.arcAngle, a1) <= sweep + EPS;
  // Shrink the corner radius until the corners fit inside the sector.
  let outerStart: Corner | null = null;
  let outerEnd: Corner | null = null;
  let innerStart: Corner | null = null;
  let innerEnd: Corner | null = null;
  // The offset edges meet at the apex (distance h / sin(sweep / 2) from the centre).
  // When that point lies outside the inner radius, the gap swallows the inner edge
  // of the sector and it narrows to a wedge instead of an (inverted) inner arc.
  const apexDistance = h > 0 ? h / Math.sin(Math.min(HALF_PI, sweep / 2)) : 0;
  const hasInner = r0 > h + EPS && r0 > apexDistance + EPS && 2 * padAt(r0) < sweep;
  for (let attempt = 0; attempt < 12; attempt++) {
    if (rc < 0.05) rc = 0;
    outerStart = corner(a0, 1, h, rc, r1, true);
    outerEnd = corner(a1, -1, h, rc, r1, true);
    innerStart = hasInner ? corner(a0, 1, h, rc, r0, false) : null;
    innerEnd = hasInner ? corner(a1, -1, h, rc, r0, false) : null;
    if ((fits(outerStart, outerEnd) && (!hasInner || fits(innerStart, innerEnd))) || rc === 0)
      break;
    rc /= 2;
  }
  if (!outerStart || !outerEnd) return;

  if (rc > 0) {
    sink.moveTo(cx + outerStart.ex, cy + outerStart.ey);
    sink.arc(
      cx + outerStart.cx,
      cy + outerStart.cy,
      rc,
      Math.atan2(outerStart.ey - outerStart.cy, outerStart.ex - outerStart.cx),
      outerStart.arcAngle,
    );
  } else {
    sink.moveTo(cx + r1 * Math.cos(outerStart.arcAngle), cy + r1 * Math.sin(outerStart.arcAngle));
  }
  sink.arc(cx, cy, r1, outerStart.arcAngle, unwrap(outerStart.arcAngle, outerEnd.arcAngle));
  if (rc > 0) {
    sink.arc(
      cx + outerEnd.cx,
      cy + outerEnd.cy,
      rc,
      outerEnd.arcAngle,
      Math.atan2(outerEnd.ey - outerEnd.cy, outerEnd.ex - outerEnd.cx),
    );
  }

  if (innerStart && innerEnd) {
    if (rc > 0) {
      sink.lineTo(cx + innerEnd.ex, cy + innerEnd.ey);
      sink.arc(
        cx + innerEnd.cx,
        cy + innerEnd.cy,
        rc,
        Math.atan2(innerEnd.ey - innerEnd.cy, innerEnd.ex - innerEnd.cx),
        innerEnd.arcAngle + Math.PI,
      );
    } else {
      sink.lineTo(cx + r0 * Math.cos(innerEnd.arcAngle), cy + r0 * Math.sin(innerEnd.arcAngle));
    }
    sink.arc(
      cx,
      cy,
      r0,
      innerEnd.arcAngle,
      unwrapBack(innerEnd.arcAngle, innerStart.arcAngle),
      true,
    );
    if (rc > 0) {
      sink.arc(
        cx + innerStart.cx,
        cy + innerStart.cy,
        rc,
        innerStart.arcAngle + Math.PI,
        Math.atan2(innerStart.ey - innerStart.cy, innerStart.ex - innerStart.cx),
      );
    }
  } else {
    // Apex where the two (offset) edges meet.
    const mid = (a0 + a1) / 2;
    const half = (a1 - a0) / 2;
    const apex = h > 0 ? h / Math.sin(half) : 0;
    if (apex >= r1) return; // nothing left of the sector
    sink.lineTo(cx + apex * Math.cos(mid), cy + apex * Math.sin(mid));
  }
  sink.closePath();
}

/** Signed clockwise angle from `a` to `b` in (-π, π]. */
function angleBetween(a: number, b: number): number {
  let d = b - a;
  while (d <= -Math.PI) d += TAU;
  while (d > Math.PI) d -= TAU;
  return d;
}

function unwrap(from: number, to: number): number {
  let t = to;
  while (t < from) t += TAU;
  while (t - from > TAU) t -= TAU;
  return t;
}

function unwrapBack(from: number, to: number): number {
  let t = to;
  while (t > from) t -= TAU;
  while (from - t > TAU) t += TAU;
  return t;
}

export type SymbolShape =
  'circle' | 'square' | 'diamond' | 'triangle' | 'triangleDown' | 'cross' | 'star';

/** Shapes in assignment order; used as a non-colour cue to tell series apart. */
export const SYMBOL_SHAPES: readonly SymbolShape[] = [
  'circle',
  'square',
  'diamond',
  'triangle',
  'triangleDown',
  'cross',
  'star',
];

/**
 * Draws a symbol centred at (x, y). `size` is the diameter of the equivalent
 * circle; other shapes are scaled to roughly equal visual area.
 */
export function drawSymbol(
  sink: PathSink,
  shape: SymbolShape,
  x: number,
  y: number,
  size: number,
): void {
  const r = size / 2;
  switch (shape) {
    case 'square': {
      const s = r * 0.886; // equal area to the circle
      sink.moveTo(x - s, y - s);
      sink.lineTo(x + s, y - s);
      sink.lineTo(x + s, y + s);
      sink.lineTo(x - s, y + s);
      sink.closePath();
      return;
    }
    case 'diamond': {
      const s = r * 1.2;
      sink.moveTo(x, y - s);
      sink.lineTo(x + s * 0.8, y);
      sink.lineTo(x, y + s);
      sink.lineTo(x - s * 0.8, y);
      sink.closePath();
      return;
    }
    case 'triangle':
    case 'triangleDown': {
      const s = r * 1.35;
      const dir = shape === 'triangle' ? 1 : -1;
      sink.moveTo(x, y - s * dir);
      sink.lineTo(x + s * 0.866, y + s * 0.5 * dir);
      sink.lineTo(x - s * 0.866, y + s * 0.5 * dir);
      sink.closePath();
      return;
    }
    case 'cross': {
      const a = r * 1.1;
      const b = a / 3;
      sink.moveTo(x - b, y - a);
      sink.lineTo(x + b, y - a);
      sink.lineTo(x + b, y - b);
      sink.lineTo(x + a, y - b);
      sink.lineTo(x + a, y + b);
      sink.lineTo(x + b, y + b);
      sink.lineTo(x + b, y + a);
      sink.lineTo(x - b, y + a);
      sink.lineTo(x - b, y + b);
      sink.lineTo(x - a, y + b);
      sink.lineTo(x - a, y - b);
      sink.lineTo(x - b, y - b);
      sink.closePath();
      return;
    }
    case 'star': {
      const outer = r * 1.3;
      const inner = outer * 0.45;
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? outer : inner;
        const a = (i * Math.PI) / 5 - HALF_PI;
        const px = x + rad * Math.cos(a);
        const py = y + rad * Math.sin(a);
        if (i === 0) sink.moveTo(px, py);
        else sink.lineTo(px, py);
      }
      sink.closePath();
      return;
    }
    default:
      sink.moveTo(x + r, y);
      sink.arc(x, y, r, 0, TAU);
      sink.closePath();
  }
}

/** Closed or open polygon through the points. */
export function drawPolygon(
  sink: PathSink,
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  closed = true,
): void {
  const n = Math.min(xs.length, ys.length);
  if (n === 0) return;
  sink.moveTo(xs[0] as number, ys[0] as number);
  for (let i = 1; i < n; i++) sink.lineTo(xs[i] as number, ys[i] as number);
  if (closed) sink.closePath();
}
