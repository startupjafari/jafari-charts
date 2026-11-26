import type { Extent } from '../types';

const E10 = Math.sqrt(50);
const E5 = Math.sqrt(10);
const E2 = Math.sqrt(2);

/**
 * Returns a "nice" step (1, 2 or 5 × 10^n) that splits `[start, stop]` into roughly
 * `count` intervals. Negative results encode the reciprocal of fractional steps
 * (e.g. -4 means 0.25) so tick values can be computed without accumulating
 * floating point error.
 */
export function tickIncrement(start: number, stop: number, count: number): number {
  const step = (stop - start) / Math.max(0, count);
  if (!(step > 0) || !Number.isFinite(step)) return 0;
  const power = Math.floor(Math.log10(step));
  const error = step / 10 ** power;
  const factor = error >= E10 ? 10 : error >= E5 ? 5 : error >= E2 ? 2 : 1;
  return power >= 0 ? factor * 10 ** power : -(10 ** -power) / factor;
}

/** Absolute tick step (always positive). */
export function tickStep(start: number, stop: number, count: number): number {
  const lo = Math.min(start, stop);
  const hi = Math.max(start, stop);
  const inc = tickIncrement(lo, hi, count);
  if (inc === 0) return 0;
  return inc > 0 ? inc : 1 / -inc;
}

/** Evenly spaced, human-friendly tick values within `[start, stop]` (inclusive). */
export function linearTicks(start: number, stop: number, count = 5): number[] {
  if (!Number.isFinite(start) || !Number.isFinite(stop)) return [];
  if (start === stop) return count > 0 ? [start] : [];
  const reverse = stop < start;
  const lo = reverse ? stop : start;
  const hi = reverse ? start : stop;
  const inc = tickIncrement(lo, hi, count);
  if (inc === 0) return [];
  const ticks: number[] = [];
  if (inc > 0) {
    const i0 = Math.ceil(lo / inc - 1e-9);
    const i1 = Math.floor(hi / inc + 1e-9);
    for (let i = i0; i <= i1; i++) ticks.push(i * inc);
  } else {
    const k = -inc;
    const i0 = Math.ceil(lo * k - 1e-9);
    const i1 = Math.floor(hi * k + 1e-9);
    for (let i = i0; i <= i1; i++) ticks.push(i / k);
  }
  // Normalise -0 so formatting never prints "-0".
  for (let i = 0; i < ticks.length; i++) if (Object.is(ticks[i], -0)) ticks[i] = 0;
  return reverse ? ticks.reverse() : ticks;
}

/** Extends a domain so it starts and ends on round tick values. */
export function niceDomain(domain: Extent, count = 5): [number, number] {
  let [start, stop] = domain;
  const reverse = stop < start;
  if (reverse) [start, stop] = [stop, start];
  if (!Number.isFinite(start) || !Number.isFinite(stop) || start === stop) {
    return reverse ? [stop, start] : [start, stop];
  }
  let prev: number | undefined;
  for (let i = 0; i < 10; i++) {
    const inc = tickIncrement(start, stop, count);
    if (inc === prev || inc === 0) break;
    if (inc > 0) {
      start = Math.floor(start / inc) * inc;
      stop = Math.ceil(stop / inc) * inc;
    } else {
      start = Math.floor(start * -inc) / -inc;
      stop = Math.ceil(stop * -inc) / -inc;
    }
    prev = inc;
  }
  return reverse ? [stop, start] : [start, stop];
}

/** Number of fraction digits needed to print values that are multiples of `step` exactly. */
export function precisionForStep(step: number): number {
  if (!(step > 0) || !Number.isFinite(step)) return 0;
  // Snap to the nearest 1/2/5 decimal so 0.30000000000000004 → 1 digit.
  const digits = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  const scaled = step * 10 ** digits;
  return Math.abs(scaled - Math.round(scaled)) < 1e-6 ? digits : digits + 1;
}
