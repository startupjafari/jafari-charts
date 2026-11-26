import type { Extent } from '../types';
import { linearTicks, niceDomain } from './ticks';

export interface LinearScaleOptions {
  domain: Extent;
  range: Extent;
  /** Round the domain to tick-friendly bounds. */
  nice?: boolean | number;
  /** Clamp mapped values to the range. */
  clamp?: boolean;
}

export interface LinearScale {
  readonly kind: 'linear';
  readonly domain: Extent;
  readonly range: Extent;
  map(value: number): number;
  invert(pixel: number): number;
  ticks(count?: number): number[];
}

export function createLinearScale(options: LinearScaleOptions): LinearScale {
  const { range, clamp = false } = options;
  const domain: Extent = options.nice
    ? niceDomain(options.domain, typeof options.nice === 'number' ? options.nice : 5)
    : options.domain;
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const dSpan = d1 - d0;
  const rSpan = r1 - r0;
  const degenerate = dSpan === 0 || !Number.isFinite(dSpan);
  const rMin = Math.min(r0, r1);
  const rMax = Math.max(r0, r1);

  return {
    kind: 'linear',
    domain,
    range,
    map(value) {
      if (degenerate) return (r0 + r1) / 2;
      const px = r0 + ((value - d0) / dSpan) * rSpan;
      return clamp ? Math.min(rMax, Math.max(rMin, px)) : px;
    },
    invert(pixel) {
      if (rSpan === 0) return d0;
      const t = (pixel - r0) / rSpan;
      return d0 + (clamp ? Math.min(1, Math.max(0, t)) : t) * dSpan;
    },
    ticks(count = 5) {
      return linearTicks(d0, d1, count);
    },
  };
}
