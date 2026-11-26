import type { AxisTick, Rect } from '@jafari/charts-core';
import { memo } from 'react';
import { useOptionalChart } from '../providers/ChartContext';

export interface ChartAxisProps {
  position: 'bottom' | 'left' | 'right' | 'top';
  /** Ticks; defaults to the surrounding chart's ticks for this position. */
  ticks?: readonly AxisTick[];
  /** Plot rectangle; defaults to the surrounding chart's plot. */
  plot?: Rect;
  /** Draw the axis line (baseline). */
  line?: boolean;
  /** Distance between labels and the plot, px. */
  tickPadding?: number;
  /** Optional axis title. */
  title?: string;
  className?: string;
}

/** Generic axis: tick labels along one edge of the plot, optional baseline. */
export const ChartAxis = memo(function ChartAxis({
  position,
  ticks: ticksProp,
  plot: plotProp,
  line = false,
  tickPadding = 8,
  title,
  className,
}: ChartAxisProps) {
  const chart = useOptionalChart();
  const frame = chart?.frame;
  const plot = plotProp ?? chart?.plot;
  const ticks =
    ticksProp ??
    (frame
      ? position === 'bottom' || position === 'top'
        ? frame.xTicks
        : position === 'left'
          ? frame.yTicks
          : frame.y2Ticks
      : []);
  if (!plot) return null;
  const horizontal = position === 'bottom' || position === 'top';
  const edge =
    position === 'bottom'
      ? plot.y + plot.height
      : position === 'top'
        ? plot.y
        : position === 'left'
          ? plot.x
          : plot.x + plot.width;
  return (
    <g
      className={`jc-axis${className ? ` ${className}` : ''}`}
      data-position={position}
      aria-hidden="true"
    >
      {line ? (
        horizontal ? (
          <line
            className="jc-axis-line"
            x1={plot.x}
            x2={plot.x + plot.width}
            y1={edge + 0.5}
            y2={edge + 0.5}
          />
        ) : (
          <line
            className="jc-axis-line"
            x1={edge + 0.5}
            x2={edge + 0.5}
            y1={plot.y}
            y2={plot.y + plot.height}
          />
        )
      ) : null}
      {ticks.map((t) =>
        horizontal ? (
          <text
            key={`${t.value}:${t.label}`}
            x={t.position}
            y={position === 'bottom' ? edge + tickPadding : edge - tickPadding}
            textAnchor={t.anchor}
            dominantBaseline={position === 'bottom' ? 'hanging' : undefined}
          >
            {t.label}
          </text>
        ) : (
          <text
            key={`${t.value}:${t.label}`}
            x={position === 'left' ? edge - tickPadding : edge + tickPadding}
            y={t.position}
            textAnchor={position === 'left' ? 'end' : 'start'}
            dominantBaseline="central"
          >
            {t.label}
          </text>
        ),
      )}
      {title ? (
        <text
          className="jc-axis-title"
          x={horizontal ? plot.x + plot.width : position === 'left' ? plot.x : plot.x + plot.width}
          y={horizontal ? edge - 6 : plot.y - 2}
          textAnchor={horizontal || position === 'right' ? 'end' : 'start'}
        >
          {title}
        </text>
      ) : null}
    </g>
  );
});

export type XAxisProps = Omit<ChartAxisProps, 'position'> & { position?: 'bottom' | 'top' };
export type YAxisProps = Omit<ChartAxisProps, 'position'> & { position?: 'left' | 'right' };

/** Horizontal axis (bottom by default). */
export function XAxis({ position = 'bottom', ...props }: XAxisProps) {
  return <ChartAxis position={position} {...props} />;
}

/** Vertical axis (left by default). */
export function YAxis({ position = 'left', ...props }: YAxisProps) {
  return <ChartAxis position={position} {...props} />;
}
