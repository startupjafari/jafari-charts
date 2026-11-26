import { PathBuilder, type PathSink } from '../geometry/path';
import {
  drawArc,
  drawArea,
  drawLine,
  drawPolygon,
  drawRoundedRect,
  drawSymbol,
} from '../geometry/shapes';
import type { Mark, MarkStyle, Paint } from './marks';

/** Writes the geometry of any mark to a path sink (SVG builder or Canvas context). */
export function drawMark(sink: PathSink, mark: Mark): void {
  switch (mark.type) {
    case 'rect':
      if (mark.width !== 0 && mark.height !== 0) {
        drawRoundedRect(sink, mark.x, mark.y, mark.width, mark.height, mark.radius ?? 0);
      }
      return;
    case 'arc':
      drawArc(sink, mark);
      return;
    case 'line':
      drawLine(sink, mark.xs, mark.ys, mark.curve);
      return;
    case 'area':
      drawArea(sink, mark.xs, mark.y1s, mark.y0s, mark.curve);
      return;
    case 'symbol': {
      const { xs, ys, size, shape } = mark;
      const n = Math.min(xs.length, ys.length);
      for (let i = 0; i < n; i++) {
        const x = xs[i] as number;
        const y = ys[i] as number;
        const s = typeof size === 'number' ? size : (size[i] as number);
        if (Number.isFinite(x) && Number.isFinite(y) && s > 0) drawSymbol(sink, shape, x, y, s);
      }
      return;
    }
    case 'polygon':
      drawPolygon(sink, mark.xs, mark.ys, mark.closed);
      return;
    case 'rule':
      sink.moveTo(mark.x1, mark.y1);
      sink.lineTo(mark.x2, mark.y2);
      return;
  }
}

/** SVG path data for a mark. */
export function markPath(mark: Mark, precision = 2): string {
  const b = new PathBuilder(precision);
  drawMark(b, mark);
  return b.toString();
}

/** Marks that are stroked rather than filled by default. */
export function isStrokeMark(mark: Mark): boolean {
  return mark.type === 'line' || mark.type === 'rule';
}

function paintKey(paint: Paint | undefined): string {
  if (paint === undefined) return '';
  if (typeof paint === 'string') return paint;
  return JSON.stringify(paint);
}

/** Identity of the visual style; marks with equal keys can share one path element. */
export function styleKey(style: MarkStyle): string {
  return [
    paintKey(style.fill),
    style.fillOpacity ?? '',
    style.stroke ?? '',
    style.strokeWidth ?? '',
    style.strokeOpacity ?? '',
    style.dash ?? '',
    style.opacity ?? '',
  ].join('|');
}

export interface MarkBatch {
  /** Key of the first mark in the batch (stable while the data identity is stable). */
  key: string;
  style: MarkStyle;
  /** Fill vs stroke semantics of the batch. */
  stroked: boolean;
  d: string;
  /** Number of marks merged into this batch. */
  count: number;
}

/**
 * Merges consecutive marks with identical style into single paths. Fifty bars of
 * one series become one `<path>` element; hit testing is done mathematically,
 * so no per-mark DOM node is needed.
 */
export function batchMarks(marks: readonly Mark[], precision = 2): MarkBatch[] {
  const batches: MarkBatch[] = [];
  interface Open {
    key: string;
    style: MarkStyle;
    stroked: boolean;
    mergeable: boolean;
    sk: string;
    builder: PathBuilder;
    count: number;
  }
  let current: Open | null = null;
  const flush = () => {
    if (current && !current.builder.isEmpty()) {
      const { key, style, stroked, builder, count } = current;
      batches.push({ key, style, stroked, d: builder.toString(), count });
    }
  };
  for (const mark of marks) {
    const stroked = isStrokeMark(mark);
    // Areas, lines and polygons are never merged: overlapping fills would combine
    // under the nonzero rule, and each series needs its own element.
    const mergeable =
      mark.type === 'rect' || mark.type === 'arc' || mark.type === 'symbol' || mark.type === 'rule';
    const sk = `${stroked ? 's' : 'f'}:${styleKey(mark)}`;
    if (!current || !mergeable || !current.mergeable || current.sk !== sk) {
      flush();
      current = {
        key: mark.key,
        style: pickStyle(mark),
        stroked,
        mergeable,
        sk,
        builder: new PathBuilder(precision),
        count: 0,
      };
    }
    drawMark(current.builder, mark);
    current.count++;
  }
  flush();
  return batches;
}

export function pickStyle(mark: MarkStyle): MarkStyle {
  const { fill, fillOpacity, stroke, strokeWidth, strokeOpacity, dash, opacity } = mark;
  const style: MarkStyle = {};
  if (fill !== undefined) style.fill = fill;
  if (fillOpacity !== undefined) style.fillOpacity = fillOpacity;
  if (stroke !== undefined) style.stroke = stroke;
  if (strokeWidth !== undefined) style.strokeWidth = strokeWidth;
  if (strokeOpacity !== undefined) style.strokeOpacity = strokeOpacity;
  if (dash !== undefined) style.dash = dash;
  if (opacity !== undefined) style.opacity = opacity;
  return style;
}
