import type { ReactNode } from 'react';

export interface ChartStateProps {
  children?: ReactNode;
}

/** Shown when there is nothing to plot. Keeps the chart's footprint (no layout jump). */
export function ChartEmptyState({ children }: ChartStateProps) {
  return (
    <div className="jc-state" role="status">
      {children}
    </div>
  );
}

/**
 * Loading without data: a static placeholder (no infinite animation). With data,
 * charts keep the previous render at reduced opacity instead (no skeleton flash).
 */
export function ChartLoadingState({
  children,
  width,
  height,
}: ChartStateProps & { width: number; height: number }) {
  const bars = Math.max(4, Math.min(12, Math.floor(width / 60)));
  const step = width / bars;
  return (
    <div className="jc-state" role="status" aria-busy="true">
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden="true"
      >
        {Array.from({ length: bars }, (_, i) => {
          const h = (height - 32) * (0.3 + 0.5 * Math.abs(Math.sin(i * 1.7)));
          return (
            <rect
              key={i}
              className="jc-placeholder"
              x={i * step + step * 0.3}
              y={height - 16 - h}
              width={step * 0.4}
              height={h}
              rx={4}
            />
          );
        })}
      </svg>
      <span className="jc-sr-only">{children}</span>
    </div>
  );
}

export function ChartErrorState({
  children,
  onRetry,
  retryLabel,
}: ChartStateProps & { onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="jc-state jc-state-error" role="alert">
      <span>{children}</span>
      {onRetry ? (
        <button type="button" className="jc-button" onClick={onRetry}>
          {retryLabel ?? 'Retry'}
        </button>
      ) : null}
    </div>
  );
}
