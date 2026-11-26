import type { CornerRadii, SymbolShape } from '../geometry/shapes';
import type { CurveType } from '../interpolation/curves';

/**
 * The scene model: every chart layout produces a flat list of data marks. The
 * SVG and Canvas renderers draw the same marks, and the transition system
 * animates between two mark lists by key. Marks carry semantic indices
 * (series / datum) used by hit testing and accessibility.
 */

export interface GradientStop {
  offset: number;
  color: string;
  opacity: number;
}

/** Linear gradient in user space (pixel coordinates). */
export interface LinearGradientPaint {
  type: 'linear-gradient';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stops: readonly GradientStop[];
}

/** A colour (any CSS colour, including `var(--token)`) or a gradient. */
export type Paint = string | LinearGradientPaint;

export interface MarkStyle {
  fill?: Paint;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  /** SVG dash array, e.g. "4 3". */
  dash?: string;
  opacity?: number;
}

interface MarkBase extends MarkStyle {
  /** Stable identity across updates (used for transitions and React keys). */
  key: string;
  /** Series index this mark belongs to. */
  series?: number;
  /** Datum index this mark represents. */
  index?: number;
}

export interface RectMark extends MarkBase {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number | CornerRadii;
  /** State the mark grows from on enter (and returns to on exit). */
  enter?: Partial<Pick<RectMark, 'x' | 'y' | 'width' | 'height' | 'opacity'>>;
}

export interface ArcMark extends MarkBase {
  type: 'arc';
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  /** Chart angles: 0 at 12 o'clock, clockwise, radians. */
  startAngle: number;
  endAngle: number;
  cornerRadius?: number;
  padding?: number;
  enter?: Partial<
    Pick<ArcMark, 'startAngle' | 'endAngle' | 'innerRadius' | 'outerRadius' | 'opacity'>
  >;
}

export interface LineMark extends MarkBase {
  type: 'line';
  xs: Float64Array;
  ys: Float64Array;
  curve: CurveType;
  enter?: { ys?: Float64Array; opacity?: number };
}

export interface AreaMark extends MarkBase {
  type: 'area';
  xs: Float64Array;
  y1s: Float64Array;
  y0s: Float64Array | number;
  curve: CurveType;
  enter?: { y1s?: Float64Array; opacity?: number };
}

/** A batch of points drawn with one symbol shape (scatter series, line dots). */
export interface SymbolMark extends MarkBase {
  type: 'symbol';
  xs: Float64Array;
  ys: Float64Array;
  /** Diameter in px, constant or per point. */
  size: number | Float64Array;
  shape: SymbolShape;
  /** Original datum index per point (when the batch is a subset). */
  indices?: Uint32Array;
  enter?: { size?: number; opacity?: number };
}

export interface PolygonMark extends MarkBase {
  type: 'polygon';
  xs: Float64Array;
  ys: Float64Array;
  closed: boolean;
  enter?: { xs?: Float64Array; ys?: Float64Array; opacity?: number };
}

export interface RuleMark extends MarkBase {
  type: 'rule';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  enter?: Partial<Pick<RuleMark, 'x1' | 'y1' | 'x2' | 'y2' | 'opacity'>>;
}

export type Mark = RectMark | ArcMark | LineMark | AreaMark | SymbolMark | PolygonMark | RuleMark;
export type MarkType = Mark['type'];

/** Text drawn by the SVG overlay (labels stay crisp and selectable in every renderer). */
export interface TextMark {
  key: string;
  x: number;
  y: number;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
  baseline?: 'auto' | 'middle' | 'hanging';
  /** Token-based colour; defaults to the secondary text colour. */
  tone?: 'primary' | 'secondary' | 'muted' | 'inverse';
  /** Explicit fill, e.g. for labels inside coloured marks. */
  fill?: string;
  fontSize?: number;
  fontWeight?: number;
  /** Rotation in degrees around (x, y). */
  rotate?: number;
}

/**
 * Vertical gradient that is strongest at the far end of the area and fades to
 * `minOpacity` at the baseline, mirrored for the part of an area below the
 * baseline (negative values).
 */
export function areaGradient(
  color: string,
  top: number,
  baseline: number,
  bottom: number,
  maxOpacity = 0.24,
  minOpacity = 0,
): LinearGradientPaint {
  const lo = Math.min(top, bottom);
  const hi = Math.max(top, bottom);
  const span = hi - lo || 1;
  const b = Math.min(1, Math.max(0, (baseline - lo) / span));
  const stops: GradientStop[] = [];
  if (b > 0) stops.push({ offset: 0, color, opacity: maxOpacity });
  stops.push({ offset: b, color, opacity: minOpacity });
  if (b < 1) {
    // Fade below the baseline in proportion to the distance from it.
    const below = (hi - baseline) / Math.max(1e-9, baseline - lo || span);
    stops.push({
      offset: 1,
      color,
      opacity: b > 0 ? Math.min(maxOpacity, maxOpacity * below) : maxOpacity,
    });
  }
  return { type: 'linear-gradient', x1: 0, y1: lo, x2: 0, y2: hi, stops };
}
