import type { Extent } from '../types';

export interface ZoomLimits {
  /** The full data extent; zoomed domains never leave it. */
  bounds: Extent;
  /** Smallest allowed span (in domain units). */
  minSpan?: number;
}

/** Keeps a domain inside the bounds while preserving its span where possible. */
export function clampDomain(domain: Extent, limits: ZoomLimits): [number, number] {
  const [b0, b1] = limits.bounds;
  const full = b1 - b0;
  const minSpan = Math.min(full, Math.max(limits.minSpan ?? full / 1000, 0));
  let [d0, d1] = domain[0] <= domain[1] ? domain : [domain[1], domain[0]];
  let span = Math.max(minSpan, d1 - d0);
  if (span >= full) return [b0, b1];
  if (d1 - d0 < span) {
    const mid = (d0 + d1) / 2;
    d0 = mid - span / 2;
    d1 = mid + span / 2;
  }
  span = d1 - d0;
  if (d0 < b0) {
    d0 = b0;
    d1 = b0 + span;
  }
  if (d1 > b1) {
    d1 = b1;
    d0 = b1 - span;
  }
  return [d0, d1];
}

/**
 * Zooms around an anchor value. `factor` < 1 zooms in, > 1 zooms out
 * (e.g. 0.8 shows 80% of the current span). The anchor stays under the pointer.
 */
export function zoomDomain(
  domain: Extent,
  anchor: number,
  factor: number,
  limits: ZoomLimits,
): [number, number] {
  const [d0, d1] = domain;
  const t = d1 === d0 ? 0.5 : (anchor - d0) / (d1 - d0);
  const span = (d1 - d0) * factor;
  const n0 = anchor - t * span;
  return clampDomain([n0, n0 + span], limits);
}

/** Shifts a domain by `delta` domain units, clamped to the bounds. */
export function panDomain(domain: Extent, delta: number, limits: ZoomLimits): [number, number] {
  return clampDomain([domain[0] + delta, domain[1] + delta], limits);
}

/** True when the domain covers the full bounds (i.e. not zoomed). */
export function isFullDomain(domain: Extent, bounds: Extent, epsilon = 1e-9): boolean {
  const span = Math.abs(bounds[1] - bounds[0]) || 1;
  return (
    Math.abs(domain[0] - bounds[0]) / span < epsilon &&
    Math.abs(domain[1] - bounds[1]) / span < epsilon
  );
}

/** Wheel delta (pixels) → zoom factor. Smooth for trackpads, stepped for mice. */
export function wheelZoomFactor(deltaY: number, deltaMode = 0): number {
  const px = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 400 : deltaY;
  return Math.exp(Math.max(-1, Math.min(1, px * 0.002)));
}
