import { cancelFrame, requestFrame } from '../interaction/scheduler';
import type { EasingFunction } from './easing';

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolates two numeric arrays. Arrays of different length are resampled onto
 * the target length so a series can grow or shrink smoothly. NaN (gaps) snap to
 * the target immediately.
 */
export function interpolateArray(
  from: ArrayLike<number>,
  to: ArrayLike<number>,
  t: number,
  out?: Float64Array,
): Float64Array {
  const n = to.length;
  const result = out && out.length === n ? out : new Float64Array(n);
  const m = from.length;
  for (let i = 0; i < n; i++) {
    const b = to[i] as number;
    let a: number;
    if (m === n) a = from[i] as number;
    else if (m === 0) a = b;
    else {
      const pos = n === 1 ? 0 : (i / (n - 1)) * (m - 1);
      const lo = Math.floor(pos);
      const hi = Math.min(m - 1, lo + 1);
      a = lerp(from[lo] as number, from[hi] as number, pos - lo);
    }
    result[i] = Number.isFinite(a) && Number.isFinite(b) ? a + (b - a) * t : b;
  }
  return result;
}

export interface TweenOptions {
  duration: number;
  easing: EasingFunction;
  /** Called every frame with eased progress (0–1). */
  onUpdate: (t: number) => void;
  onComplete?: () => void;
  delay?: number;
}

/**
 * Runs a frame-driven tween and returns a cancel function. No work is scheduled
 * once it completes, so idle charts consume no CPU.
 */
export function tween({
  duration,
  easing,
  onUpdate,
  onComplete,
  delay = 0,
}: TweenOptions): () => void {
  if (duration <= 0) {
    onUpdate(1);
    onComplete?.();
    return () => {};
  }
  let start = -1;
  let handle: number | null = requestFrame(function frame(now) {
    if (start < 0) start = now + delay;
    const elapsed = now - start;
    if (elapsed < 0) {
      handle = requestFrame(frame);
      return;
    }
    const p = Math.min(1, elapsed / duration);
    onUpdate(easing(p));
    if (p < 1) handle = requestFrame(frame);
    else {
      handle = null;
      onComplete?.();
    }
  });
  return () => {
    if (handle !== null) cancelFrame(handle);
    handle = null;
  };
}
