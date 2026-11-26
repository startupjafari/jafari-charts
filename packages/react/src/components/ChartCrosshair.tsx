import { useCallback } from 'react';
import { useStoreSelector } from '../hooks/useStoreSelector';
import { useChart, type InteractionState } from '../providers/ChartContext';

export interface ChartCrosshairProps {
  /** Also draw a horizontal line at the pointer. */
  horizontal?: boolean;
  /** Draw the vertical line (default true). */
  vertical?: boolean;
}

/** Hairline that snaps to the active x position; fades in via CSS. */
export function ChartCrosshair({ horizontal = false, vertical = true }: ChartCrosshairProps) {
  const { store, plot, frame } = useChart();
  const select = useCallback(
    (s: InteractionState) =>
      s.active
        ? `${Math.round(s.active.x)}:${horizontal && s.pointer ? Math.round(s.pointer.y) : ''}`
        : '',
    [horizontal],
  );
  const key = useStoreSelector(store, select);
  if (!key) return null;
  const [xs, ys] = key.split(':');
  const x = Number(xs) + 0.5;
  const categoryOnY = frame?.y.kind === 'band';
  return (
    <g className="jc-animate-in" aria-hidden="true">
      {vertical && !categoryOnY ? (
        <line className="jc-crosshair" x1={x} x2={x} y1={plot.y} y2={plot.y + plot.height} />
      ) : null}
      {horizontal && ys ? (
        <line
          className="jc-crosshair"
          x1={plot.x}
          x2={plot.x + plot.width}
          y1={Number(ys) + 0.5}
          y2={Number(ys) + 0.5}
        />
      ) : null}
    </g>
  );
}

/** Soft band behind the active category (bar charts). */
export function ChartCursor({
  bandRect,
}: {
  bandRect: (position: number) => { x: number; y: number; width: number; height: number } | null;
}) {
  const { store } = useChart();
  const position = useStoreSelector(store, selectPosition);
  if (position < 0) return null;
  const r = bandRect(position);
  if (!r) return null;
  return (
    <rect
      className="jc-cursor"
      x={r.x}
      y={r.y}
      width={r.width}
      height={r.height}
      rx={6}
      aria-hidden="true"
    />
  );
}

const selectPosition = (s: InteractionState) => s.active?.position ?? -1;
