import type { AxisTick, Rect } from '@startupjafari/charts-core';
import { memo } from 'react';
import { useOptionalChart } from '../providers/ChartContext';

export interface ChartGridProps {
  /** Horizontal lines at y ticks (default true). */
  horizontal?: boolean;
  /** Vertical lines at x ticks (default false). */
  vertical?: boolean;
  xTicks?: readonly AxisTick[];
  yTicks?: readonly AxisTick[];
  plot?: Rect;
  /** Emphasise the zero line when the value axis spans negative values. */
  zeroLine?: number | null;
}

/** Hairline, solid, recessive gridlines. */
export const ChartGrid = memo(function ChartGrid({
  horizontal = true,
  vertical = false,
  xTicks,
  yTicks,
  plot: plotProp,
  zeroLine,
}: ChartGridProps) {
  const chart = useOptionalChart();
  const plot = plotProp ?? chart?.plot;
  const xs = xTicks ?? chart?.frame?.xTicks ?? [];
  const ys = yTicks ?? chart?.frame?.yTicks ?? [];
  if (!plot) return null;
  const snap = (v: number) => Math.round(v) + 0.5;
  return (
    <g className="jc-grid" aria-hidden="true">
      {horizontal
        ? ys.map((t) => (
            <line
              key={`h${t.value}`}
              x1={plot.x}
              x2={plot.x + plot.width}
              y1={snap(t.position)}
              y2={snap(t.position)}
            />
          ))
        : null}
      {vertical
        ? xs.map((t) => (
            <line
              key={`v${t.value}`}
              y1={plot.y}
              y2={plot.y + plot.height}
              x1={snap(t.position)}
              x2={snap(t.position)}
            />
          ))
        : null}
      {zeroLine !== undefined && zeroLine !== null ? (
        <line
          className="jc-axis-line"
          x1={plot.x}
          x2={plot.x + plot.width}
          y1={snap(zeroLine)}
          y2={snap(zeroLine)}
        />
      ) : null}
    </g>
  );
});
