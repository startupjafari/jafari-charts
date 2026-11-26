import type { Extent } from '../types';

export interface LogScaleOptions {
  domain: Extent;
  range: Extent;
  base?: number;
  /** Expand the domain to whole powers of the base. */
  nice?: boolean;
  clamp?: boolean;
}

export interface LogScale {
  readonly kind: 'log';
  readonly domain: Extent;
  readonly range: Extent;
  readonly base: number;
  /** Returns NaN for values that cannot be shown on this scale (zero / opposite sign). */
  map(value: number): number;
  invert(pixel: number): number;
  ticks(count?: number): number[];
}

/**
 * Logarithmic scale. Domains must be strictly positive or strictly negative;
 * values of the opposite sign (and zero) map to NaN and are treated as gaps.
 */
export function createLogScale(options: LogScaleOptions): LogScale {
  const base = options.base ?? 10;
  const logBase = Math.log(base);
  const { range, clamp = false } = options;
  let [d0, d1] = options.domain;
  const negative = d0 < 0 && d1 < 0;
  const sign = negative ? -1 : 1;
  if (!(d0 * sign > 0)) d0 = sign;
  if (!(d1 * sign > 0)) d1 = d0 * base;

  const log = (v: number) => Math.log(v * sign) / logBase;
  const pow = (e: number) => sign * base ** e;

  if (options.nice) {
    const lo = Math.min(log(d0), log(d1));
    const hi = Math.max(log(d0), log(d1));
    const ascending = log(d0) <= log(d1);
    const n0 = pow(Math.floor(lo));
    const n1 = pow(Math.ceil(hi));
    [d0, d1] = ascending ? [n0, n1] : [n1, n0];
  }

  const l0 = log(d0);
  const l1 = log(d1);
  const lSpan = l1 - l0;
  const [r0, r1] = range;
  const rSpan = r1 - r0;
  const rMin = Math.min(r0, r1);
  const rMax = Math.max(r0, r1);

  return {
    kind: 'log',
    domain: [d0, d1],
    range,
    base,
    map(value) {
      if (!(value * sign > 0)) return Number.NaN;
      if (lSpan === 0) return (r0 + r1) / 2;
      const px = r0 + ((log(value) - l0) / lSpan) * rSpan;
      return clamp ? Math.min(rMax, Math.max(rMin, px)) : px;
    },
    invert(pixel) {
      if (rSpan === 0) return d0;
      return pow(l0 + ((pixel - r0) / rSpan) * lSpan);
    },
    ticks(count = 5) {
      const lo = Math.min(l0, l1);
      const hi = Math.max(l0, l1);
      const vMin = Math.min(d0 * sign, d1 * sign);
      const vMax = Math.max(d0 * sign, d1 * sign);
      const decades = Math.ceil(hi) - Math.floor(lo);
      const ticks: number[] = [];
      if (decades <= 0) return [d0];
      if (decades > count) {
        // Too many decades: step whole powers.
        const stepE = Math.ceil(decades / count);
        for (let e = Math.ceil(lo); e <= Math.floor(hi); e += stepE) ticks.push(sign * base ** e);
      } else {
        const multiples = decades * 3 <= count * 1.5 && base === 10 ? [1, 2, 5] : [1];
        for (let e = Math.floor(lo); e <= Math.ceil(hi); e++) {
          for (const m of multiples) {
            const v = m * base ** e;
            if (v >= vMin * (1 - 1e-12) && v <= vMax * (1 + 1e-12)) ticks.push(sign * v);
          }
        }
      }
      ticks.sort((a, b) => a - b);
      return d0 > d1 ? ticks.reverse() : ticks;
    },
  };
}
