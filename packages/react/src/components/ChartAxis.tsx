import { LABEL_LINE_HEIGHT, type AxisTick, type Rect } from '@jafari/charts-core';
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

/**
 * A tick label: plain text, or one `<tspan>` per line of a wrapped label. `shift` is the
 * offset of the first line in lines (vertical centring); every tspan repeats the anchor
 * position and baseline so the lines align in every browser.
 */
function tickText(t: AxisTick, x: number, shift: number, baseline?: 'hanging' | 'central') {
  if (!t.lines || t.lines.length < 2) return t.label;
  return t.lines.map((line, i) => (
    <tspan
      key={i}
      x={x}
      dy={`${(i ? 1 : shift) * LABEL_LINE_HEIGHT}em`}
      dominantBaseline={baseline}
    >
      {line}
    </tspan>
  ));
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
  // Label x of vertical axes.
  const x = position === 'left' ? edge - tickPadding : edge + tickPadding;
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
      {ticks.map((t) => {
        const lines = t.lines?.length ?? 1;
        return horizontal ? (
          <text
            key={`${t.value}:${t.label}`}
            x={t.position}
            y={position === 'bottom' ? edge + tickPadding : edge - tickPadding}
            textAnchor={t.anchor}
            dominantBaseline={position === 'bottom' ? 'hanging' : undefined}
          >
            {position === 'bottom'
              ? tickText(t, t.position, 0, 'hanging')
              : tickText(t, t.position, 1 - lines)}
          </text>
        ) : (
          <text
            key={`${t.value}:${t.label}`}
            x={x}
            y={t.position}
            textAnchor={position === 'left' ? 'end' : 'start'}
            dominantBaseline="central"
          >
            {tickText(t, x, (1 - lines) / 2, 'central')}
          </text>
        );
      })}
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
