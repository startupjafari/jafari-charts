import {
  buildPath,
  drawSymbol,
  type LinearGradientPaint,
  type SymbolShape,
} from '@startupjafari/charts-core';
import type { CSSProperties, ReactNode } from 'react';
import { GradientDef } from '../primitives/Gradient';

export interface ChartLabelProps {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: 'start' | 'middle' | 'end';
  tone?: 'primary' | 'secondary' | 'muted' | 'inverse';
  fontSize?: number;
  className?: string;
}

/** Text in chart coordinates using text tokens (never the series colour). */
export function ChartLabel({
  x,
  y,
  children,
  anchor = 'middle',
  tone = 'secondary',
  fontSize,
  className,
}: ChartLabelProps) {
  return (
    <text
      className={`jc-label${className ? ` ${className}` : ''}`}
      data-tone={tone}
      x={x}
      y={y}
      textAnchor={anchor}
      style={fontSize ? { fontSize } : undefined}
    >
      {children}
    </text>
  );
}

export interface ChartGradientProps {
  id: string;
  color: string;
  /** Opacity at the start (top) and end (bottom). */
  from?: number;
  to?: number;
  /** Direction of the gradient. */
  direction?: 'vertical' | 'horizontal';
}

/** Linear gradient definition for custom marks (`fill="url(#id)"`). */
export function ChartGradient({
  id,
  color,
  from = 0.24,
  to = 0,
  direction = 'vertical',
}: ChartGradientProps) {
  const paint: LinearGradientPaint = {
    type: 'linear-gradient',
    x1: 0,
    y1: 0,
    x2: direction === 'horizontal' ? 1 : 0,
    y2: direction === 'vertical' ? 1 : 0,
    stops: [
      { offset: 0, color, opacity: from },
      { offset: 1, color, opacity: to },
    ],
  };
  return (
    <defs>
      <linearGradient id={id} x1={paint.x1} y1={paint.y1} x2={paint.x2} y2={paint.y2}>
        {paint.stops.map((s, i) => (
          <stop key={i} offset={s.offset} style={{ stopColor: s.color, stopOpacity: s.opacity }} />
        ))}
      </linearGradient>
    </defs>
  );
}

export { GradientDef };

export interface ChartMarkerProps {
  x?: number;
  y?: number;
  shape?: SymbolShape;
  size?: number;
  color: string;
  /** Surface-coloured ring so the marker stays legible over lines. */
  ring?: boolean;
  className?: string;
}

/** A single symbol (circle, square, diamond, triangle…). */
export function ChartMarker({
  x = 0,
  y = 0,
  shape = 'circle',
  size = 8,
  color,
  ring = true,
  className,
}: ChartMarkerProps) {
  const d = buildPath((s) => drawSymbol(s, shape, x, y, size));
  const style: CSSProperties = {
    fill: color,
    ...(ring ? { stroke: 'var(--jc-bg)', strokeWidth: 4, paintOrder: 'stroke' } : {}),
  };
  return <path className={className} d={d} style={style} />;
}

export interface ChartAnnotationProps {
  x: number;
  y: number;
  /** Where the note sits relative to the point. */
  dx?: number;
  dy?: number;
  children: ReactNode;
  /** Draw a connector from the point to the note. */
  connector?: boolean;
}

/** A short note attached to a point, with an optional leader line. */
export function ChartAnnotation({
  x,
  y,
  dx = 12,
  dy = -18,
  children,
  connector = true,
}: ChartAnnotationProps) {
  return (
    <g aria-hidden="true">
      {connector ? (
        <line
          className="jc-ref-line"
          x1={x}
          y1={y}
          x2={x + dx}
          y2={y + dy}
          style={{ strokeDasharray: 'none' }}
        />
      ) : null}
      <text
        className="jc-annotation"
        x={x + dx + (dx >= 0 ? 4 : -4)}
        y={y + dy}
        textAnchor={dx >= 0 ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {children}
      </text>
    </g>
  );
}
