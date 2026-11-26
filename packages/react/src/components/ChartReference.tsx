import { isBandScale, type AnyScale } from '@jafari/charts-core';
import type { ReactNode } from 'react';
import { useChart } from '../providers/ChartContext';

type Value = number | string | Date;

function toPixel(scale: AnyScale, value: Value): number {
  if (isBandScale(scale)) {
    // Numbers are positions in the full category list; a zoomed axis shows a window of it.
    const i =
      typeof value === 'number' ? value - (scale.offset ?? 0) : scale.domain.indexOf(String(value));
    return scale.center(i);
  }
  if (scale.kind === 'time')
    return scale.map(
      value instanceof Date ? value : typeof value === 'string' ? Date.parse(value) : value,
    );
  return scale.map(typeof value === 'number' ? value : Number(value));
}

/**
 * Converts data values to chart pixels inside a cartesian chart, e.g. to place
 * `ChartLabel`, `ChartMarker` or `ChartAnnotation` (which take pixels) at data points.
 * `x` accepts the x/category value (number, Date, ISO string or category label);
 * `y` accepts a value on the value axis.
 */
export function useChartCoordinates(): {
  x: (value: Value) => number;
  y: (value: number) => number;
} {
  const { horizontal, xPx, yPx } = useScales();
  return horizontal ? { x: (v) => yPx(v as number), y: (v) => xPx(v) } : { x: xPx, y: yPx };
}

function useScales() {
  const { frame, plot } = useChart();
  if (!frame) throw new Error('Reference primitives require a cartesian chart.');
  const horizontal = frame.y.kind === 'band';
  // `y` always refers to the value axis, `x` to the category/x axis, in either orientation.
  const xPx = (v: Value) => (horizontal ? toPixel(frame.y, v) : toPixel(frame.x, v));
  const yPx = (v: Value) => (horizontal ? toPixel(frame.x, v) : toPixel(frame.y, v));
  return { plot, horizontal, xPx, yPx };
}

export interface ChartReferenceLineProps {
  /** Value on the value axis (horizontal line in vertical charts). */
  y?: number;
  /** Value on the x/category axis. */
  x?: Value;
  label?: ReactNode;
  /** Label placement along the line. */
  labelPosition?: 'start' | 'end';
  color?: string;
  dashed?: boolean;
}

/** Target lines, thresholds, averages. */
export function ChartReferenceLine({
  y,
  x,
  label,
  labelPosition = 'end',
  color,
  dashed = true,
}: ChartReferenceLineProps) {
  const { plot, horizontal, xPx, yPx } = useScales();
  const style = {
    ...(color ? { stroke: color } : {}),
    ...(dashed ? {} : { strokeDasharray: 'none' }),
  };
  if (y !== undefined) {
    const p = yPx(y);
    if (!Number.isFinite(p)) return null;
    if (horizontal) {
      return (
        <g aria-hidden="true">
          <line
            className="jc-ref-line"
            x1={p}
            x2={p}
            y1={plot.y}
            y2={plot.y + plot.height}
            style={style}
          />
          {label ? (
            <text className="jc-ref-label" x={p + 4} y={plot.y + 10}>
              {label}
            </text>
          ) : null}
        </g>
      );
    }
    return (
      <g aria-hidden="true">
        <line
          className="jc-ref-line"
          x1={plot.x}
          x2={plot.x + plot.width}
          y1={p}
          y2={p}
          style={style}
        />
        {label ? (
          <text
            className="jc-ref-label"
            x={labelPosition === 'end' ? plot.x + plot.width : plot.x + 4}
            y={p - 6}
            textAnchor={labelPosition === 'end' ? 'end' : 'start'}
          >
            {label}
          </text>
        ) : null}
      </g>
    );
  }
  if (x !== undefined) {
    const p = xPx(x);
    if (!Number.isFinite(p)) return null;
    return horizontal ? (
      <line
        className="jc-ref-line"
        x1={plot.x}
        x2={plot.x + plot.width}
        y1={p}
        y2={p}
        style={style}
        aria-hidden="true"
      />
    ) : (
      <g aria-hidden="true">
        <line
          className="jc-ref-line"
          x1={p}
          x2={p}
          y1={plot.y}
          y2={plot.y + plot.height}
          style={style}
        />
        {label ? (
          <text className="jc-ref-label" x={p + 4} y={plot.y + 10}>
            {label}
          </text>
        ) : null}
      </g>
    );
  }
  return null;
}

export interface ChartReferenceAreaProps {
  x1?: Value;
  x2?: Value;
  y1?: number;
  y2?: number;
  label?: ReactNode;
  color?: string;
  opacity?: number;
}

/** Highlighted region (target band, weekend, incident window). */
export function ChartReferenceArea({
  x1,
  x2,
  y1,
  y2,
  label,
  color,
  opacity,
}: ChartReferenceAreaProps) {
  const { plot, horizontal, xPx, yPx } = useScales();
  let a0 = horizontal ? plot.y : plot.x;
  let a1 = horizontal ? plot.y + plot.height : plot.x + plot.width;
  let b0 = horizontal ? plot.x : plot.y + plot.height;
  let b1 = horizontal ? plot.x + plot.width : plot.y;
  if (x1 !== undefined) a0 = xPx(x1);
  if (x2 !== undefined) a1 = xPx(x2);
  if (y1 !== undefined) b0 = yPx(y1);
  if (y2 !== undefined) b1 = yPx(y2);
  const [ax, ay, aw, ah] = horizontal
    ? [Math.min(b0, b1), Math.min(a0, a1), Math.abs(b1 - b0), Math.abs(a1 - a0)]
    : [Math.min(a0, a1), Math.min(b0, b1), Math.abs(a1 - a0), Math.abs(b1 - b0)];
  if (![ax, ay, aw, ah].every(Number.isFinite)) return null;
  return (
    <g aria-hidden="true">
      <rect
        className="jc-ref-area"
        x={ax}
        y={ay}
        width={aw}
        height={ah}
        style={{ ...(color ? { fill: color } : {}), ...(opacity !== undefined ? { opacity } : {}) }}
      />
      {label ? (
        <text className="jc-ref-label" x={ax + 6} y={ay + 14}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

export interface ChartReferenceDotProps {
  x: Value;
  y: number;
  r?: number;
  color?: string;
  label?: ReactNode;
}

/** A highlighted point (record, anomaly, milestone). */
export function ChartReferenceDot({ x, y, r = 5, color, label }: ChartReferenceDotProps) {
  const { horizontal, xPx, yPx } = useScales();
  const cx = horizontal ? yPx(y) : xPx(x);
  const cy = horizontal ? xPx(x) : yPx(y);
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  return (
    <g aria-hidden="true">
      <circle
        className="jc-ring"
        cx={cx}
        cy={cy}
        r={r}
        style={{ fill: color ?? 'var(--jc-text)', strokeWidth: 4 }}
      />
      {label ? (
        <text className="jc-annotation" x={cx + r + 4} y={cy - r - 2}>
          {label}
        </text>
      ) : null}
    </g>
  );
}
