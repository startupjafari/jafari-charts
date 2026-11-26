import { toCanvasAngle } from '../geometry/shapes';

export const TAU = Math.PI * 2;

export interface PolarFrame {
  cx: number;
  cy: number;
  radius: number;
}

/**
 * Largest circle (or partial ring spanning `[startAngle, endAngle]`) that fits the
 * box. Partial arcs (gauges) are measured by their real bounding box, so a
 * semicircle uses the full width instead of wasting half the height.
 */
export function computePolarFrame(
  width: number,
  height: number,
  options: { padding?: number; startAngle?: number; endAngle?: number; innerRatio?: number } = {},
): PolarFrame {
  const { padding = 8, startAngle = 0, endAngle = TAU, innerRatio = 0 } = options;
  const w = Math.max(0, width - padding * 2);
  const h = Math.max(0, height - padding * 2);
  const box = arcBounds(startAngle, endAngle, innerRatio);
  const bw = box.x1 - box.x0;
  const bh = box.y1 - box.y0;
  const radius = Math.max(
    0,
    Math.min(
      bw > 0 ? w / bw : Number.POSITIVE_INFINITY,
      bh > 0 ? h / bh : Number.POSITIVE_INFINITY,
    ),
  );
  const r = Number.isFinite(radius) ? radius : 0;
  // Centre the arc's bounding box in the available area.
  const cx = padding + (w - bw * r) / 2 - box.x0 * r;
  const cy = padding + (h - bh * r) / 2 - box.y0 * r;
  return { cx, cy, radius: r };
}

/** Bounding box of a unit-radius annular sector (chart angles). */
export function arcBounds(
  startAngle: number,
  endAngle: number,
  innerRatio = 0,
): { x0: number; y0: number; x1: number; y1: number } {
  const a0 = Math.min(startAngle, endAngle);
  const a1 = Math.max(startAngle, endAngle);
  const pts: Array<[number, number]> = [];
  const add = (a: number, r: number) => {
    const c = toCanvasAngle(a);
    pts.push([r * Math.cos(c), r * Math.sin(c)]);
  };
  add(a0, 1);
  add(a1, 1);
  add(a0, innerRatio);
  add(a1, innerRatio);
  // Extreme points at multiples of 90° inside the sweep.
  for (let k = Math.ceil(a0 / (Math.PI / 2)); k * (Math.PI / 2) <= a1; k++)
    add(k * (Math.PI / 2), 1);
  if (a1 - a0 >= TAU - 1e-9) return { x0: -1, y0: -1, x1: 1, y1: 1 };
  let x0 = Number.POSITIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1 };
}

export interface PieSlice {
  /** Index of the value in the input. */
  index: number;
  value: number;
  /** Share of the total (0–1). */
  share: number;
  startAngle: number;
  endAngle: number;
}

export interface PieOptions {
  startAngle?: number;
  endAngle?: number;
  /** Order slices by value, largest first (input order otherwise). */
  sort?: boolean;
}

/**
 * Allocates angles proportionally to values. Negative, zero and invalid values
 * get no slice. Returns an empty array when nothing is positive.
 */
export function pieLayout(values: ArrayLike<number>, options: PieOptions = {}): PieSlice[] {
  const { startAngle = 0, endAngle = TAU, sort = false } = options;
  const order: number[] = [];
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] as number;
    if (Number.isFinite(v) && v > 0) {
      order.push(i);
      total += v;
    }
  }
  if (total <= 0) return [];
  if (sort) order.sort((a, b) => (values[b] as number) - (values[a] as number) || a - b);
  const span = endAngle - startAngle;
  let angle = startAngle;
  return order.map((index) => {
    const value = values[index] as number;
    const share = value / total;
    const slice = { index, value, share, startAngle: angle, endAngle: angle + share * span };
    angle = slice.endAngle;
    return slice;
  });
}

/** Chart angle (0 at 12 o'clock, clockwise, in [0, 2π)) of a point relative to a centre. */
export function pointAngle(x: number, y: number, cx: number, cy: number): number {
  const a = Math.atan2(y - cy, x - cx) + Math.PI / 2;
  return a < 0 ? a + TAU : a;
}

/** Index (into `slices`) of the slice under the point, or -1. */
export function hitTestSlices(
  slices: readonly Pick<PieSlice, 'startAngle' | 'endAngle'>[],
  x: number,
  y: number,
  frame: { cx: number; cy: number; innerRadius: number; outerRadius: number },
): number {
  const r = Math.hypot(x - frame.cx, y - frame.cy);
  if (r < frame.innerRadius || r > frame.outerRadius) return -1;
  const a = pointAngle(x, y, frame.cx, frame.cy);
  for (let i = 0; i < slices.length; i++) {
    const s = slices[i] as PieSlice;
    // Compare modulo 2π so slices that start at negative angles still match.
    const start = ((s.startAngle % TAU) + TAU) % TAU;
    const sweep = s.endAngle - s.startAngle;
    const rel = (((a - start) % TAU) + TAU) % TAU;
    if (rel <= sweep) return i;
  }
  return -1;
}
