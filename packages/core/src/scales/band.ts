import type { Extent } from '../types';

export interface BandScaleOptions {
  /**
   * Category labels in display order. Duplicates are allowed: bands are addressed
   * by index, so two categories with the same label still get separate bands.
   */
  domain: readonly string[];
  range: Extent;
  /** Fraction of the step left empty between bands (0–1). */
  paddingInner?: number;
  /** Fraction of the step left empty before the first and after the last band. */
  paddingOuter?: number;
  /** Where leftover space goes: 0 = start, 0.5 = centre, 1 = end. */
  align?: number;
}

export interface BandScale {
  readonly kind: 'band' | 'point';
  readonly domain: readonly string[];
  readonly range: Extent;
  /** Width of each band (0 for point scales). */
  readonly bandwidth: number;
  /** Distance between the starts of adjacent bands. */
  readonly step: number;
  /** Start of the band at `index` (centre for point scales). */
  position(index: number): number;
  /** Centre of the band at `index`. */
  center(index: number): number;
  /** Start of the first band labelled `label`, or NaN if absent. */
  map(label: string): number;
  /** Index of the band containing `pixel` (nearest band when in padding), or -1 if empty. */
  invert(pixel: number): number;
}

/** Narrows any scale to a band/point scale. */
export function isBandScale(scale: { kind: string }): scale is BandScale {
  return scale.kind === 'band' || scale.kind === 'point';
}

export function createBandScale(options: BandScaleOptions): BandScale {
  const { domain, range } = options;
  const paddingInner = clamp01(options.paddingInner ?? 0.2);
  const paddingOuter = Math.max(0, options.paddingOuter ?? paddingInner / 2);
  const align = clamp01(options.align ?? 0.5);
  return build('band', domain, range, paddingInner, paddingOuter, align);
}

export interface PointScaleOptions {
  domain: readonly string[];
  range: Extent;
  /** Space before the first and after the last point, in steps. */
  padding?: number;
  align?: number;
}

/** A band scale with zero bandwidth: categories map to evenly spaced points. */
export function createPointScale(options: PointScaleOptions): BandScale {
  return build(
    'point',
    options.domain,
    options.range,
    1,
    Math.max(0, options.padding ?? 0.5),
    clamp01(options.align ?? 0.5),
  );
}

function build(
  kind: 'band' | 'point',
  domain: readonly string[],
  range: Extent,
  paddingInner: number,
  paddingOuter: number,
  align: number,
): BandScale {
  const n = domain.length;
  const [r0, r1] = range;
  const reverse = r1 < r0;
  const start0 = reverse ? r1 : r0;
  const stop0 = reverse ? r0 : r1;
  const span = stop0 - start0;
  const divisor = Math.max(1, n - paddingInner + paddingOuter * 2);
  const step = n === 0 ? 0 : span / divisor;
  const start = start0 + (span - step * (n - paddingInner)) * align;
  const bandwidth = kind === 'point' ? 0 : step * (1 - paddingInner);

  const position = (index: number): number => {
    if (index < 0 || index >= n) return Number.NaN;
    const i = reverse ? n - 1 - index : index;
    return start + step * i;
  };

  return {
    kind,
    domain,
    range,
    bandwidth,
    step,
    position,
    center: (index) => position(index) + bandwidth / 2,
    map: (label) => position(domain.indexOf(label)),
    invert(pixel) {
      if (n === 0 || step === 0) return n === 0 ? -1 : 0;
      // Offset so the gap between two bands is split evenly between them.
      const raw = Math.floor((pixel - start + (step - bandwidth) / 2) / step);
      const i = Math.min(n - 1, Math.max(0, raw));
      return reverse ? n - 1 - i : i;
    },
  };
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}
