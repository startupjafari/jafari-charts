import { interpolateArray, lerp } from '../interpolation/tween';
import type { Mark } from './marks';

/** A mark in its enter state (where it grows from / shrinks back to). */
export function enterState(mark: Mark): Mark {
  const e = mark.enter;
  if (!e) return { ...mark, opacity: 0 } as Mark;
  return { ...mark, ...e } as Mark;
}

const num = (
  a: number | undefined,
  b: number | undefined,
  t: number,
  fallback = 1,
): number | undefined => {
  if (a === undefined && b === undefined) return undefined;
  return lerp(a ?? fallback, b ?? fallback, t);
};

function arr(a: Float64Array, b: Float64Array, t: number): Float64Array {
  return t >= 1 ? b : interpolateArray(a, b, t);
}

/** Interpolates two marks of the same type. Colours and discrete props snap to `b`. */
export function interpolateMark(a: Mark, b: Mark, t: number): Mark {
  if (t >= 1 || a.type !== b.type) return b;
  const opacity = num(a.opacity, b.opacity, t);
  const base = opacity === undefined ? {} : { opacity };
  switch (b.type) {
    case 'rect': {
      const s = a as typeof b;
      return {
        ...b,
        ...base,
        x: lerp(s.x, b.x, t),
        y: lerp(s.y, b.y, t),
        width: lerp(s.width, b.width, t),
        height: lerp(s.height, b.height, t),
      };
    }
    case 'arc': {
      const s = a as typeof b;
      return {
        ...b,
        ...base,
        cx: lerp(s.cx, b.cx, t),
        cy: lerp(s.cy, b.cy, t),
        innerRadius: lerp(s.innerRadius, b.innerRadius, t),
        outerRadius: lerp(s.outerRadius, b.outerRadius, t),
        startAngle: lerp(s.startAngle, b.startAngle, t),
        endAngle: lerp(s.endAngle, b.endAngle, t),
      };
    }
    case 'line': {
      const s = a as typeof b;
      return { ...b, ...base, xs: arr(s.xs, b.xs, t), ys: arr(s.ys, b.ys, t) };
    }
    case 'area': {
      const s = a as typeof b;
      const y0s =
        typeof b.y0s === 'number'
          ? typeof s.y0s === 'number'
            ? lerp(s.y0s, b.y0s, t)
            : b.y0s
          : typeof s.y0s === 'number'
            ? b.y0s
            : arr(s.y0s, b.y0s, t);
      return { ...b, ...base, xs: arr(s.xs, b.xs, t), y1s: arr(s.y1s, b.y1s, t), y0s };
    }
    case 'symbol': {
      const s = a as typeof b;
      const same = s.xs.length === b.xs.length;
      const size =
        typeof s.size === 'number' && typeof b.size === 'number' ? lerp(s.size, b.size, t) : b.size;
      return same
        ? { ...b, ...base, xs: arr(s.xs, b.xs, t), ys: arr(s.ys, b.ys, t), size }
        : { ...b, ...base, size };
    }
    case 'polygon': {
      const s = a as typeof b;
      return { ...b, ...base, xs: arr(s.xs, b.xs, t), ys: arr(s.ys, b.ys, t) };
    }
    case 'rule': {
      const s = a as typeof b;
      return {
        ...b,
        ...base,
        x1: lerp(s.x1, b.x1, t),
        y1: lerp(s.y1, b.y1, t),
        x2: lerp(s.x2, b.x2, t),
        y2: lerp(s.y2, b.y2, t),
      };
    }
  }
}

export interface MarkTransition {
  /** Marks at eased progress `t` (0–1). Exiting marks are included until `t = 1`. */
  at(t: number): Mark[];
  /** True when nothing would visibly change (skip the animation). */
  readonly static: boolean;
}

/**
 * Plans a transition between two mark lists matched by key: updated marks morph,
 * new marks grow from their enter state, removed marks shrink back to it.
 */
export function transitionMarks(from: readonly Mark[], to: readonly Mark[]): MarkTransition {
  const previous = new Map<string, Mark>();
  for (const m of from) previous.set(m.key, m);
  const pairs: Array<[Mark, Mark]> = [];
  const seen = new Set<string>();
  let changed = from.length !== to.length;
  for (const m of to) {
    seen.add(m.key);
    const p = previous.get(m.key);
    if (p && p.type === m.type) {
      if (p !== m) changed = true;
      pairs.push([p, m]);
    } else {
      changed = true;
      pairs.push([enterState(m), m]);
    }
  }
  const exiting: Array<[Mark, Mark]> = [];
  for (const m of from) {
    if (!seen.has(m.key)) {
      changed = true;
      exiting.push([m, enterState(m)]);
    }
  }
  return {
    static: !changed,
    at(t) {
      if (t >= 1) return to as Mark[];
      const out: Mark[] = [];
      for (const [a, b] of exiting) out.push(interpolateMark(a, b, t));
      for (const [a, b] of pairs) out.push(interpolateMark(a, b, t));
      return out;
    },
  };
}

/** Total number of points across marks — used to skip heavy transitions. */
export function markComplexity(marks: readonly Mark[]): number {
  let n = 0;
  for (const m of marks) {
    if (m.type === 'line' || m.type === 'symbol' || m.type === 'polygon') n += m.xs.length;
    else if (m.type === 'area') n += m.xs.length * 2;
    else n += 1;
  }
  return n;
}
