import { buildPath, drawSymbol, type SymbolShape } from '@startupjafari/charts-core';
import type { SwatchKind } from '../providers/ChartContext';

export interface SeriesKeyProps {
  color: string;
  kind: SwatchKind;
  symbol?: SymbolShape;
  dash?: string;
  /** Tooltips use a short line key; legends mirror the mark shape. */
  variant?: 'legend' | 'tooltip';
}

/** Small swatch identifying a series: a line for lines, a rounded square for fills, the symbol for points. */
export function SeriesKey({
  color,
  kind,
  symbol = 'circle',
  dash,
  variant = 'legend',
}: SeriesKeyProps) {
  const showSymbol = kind === 'point' || (symbol !== 'circle' && kind === 'line');
  if (showSymbol) {
    return (
      <svg className="jc-key" width={12} height={12} viewBox="0 0 12 12" aria-hidden="true">
        <path d={buildPath((s) => drawSymbol(s, symbol, 6, 6, 8))} style={{ fill: color }} />
      </svg>
    );
  }
  if (kind === 'line' || variant === 'tooltip') {
    return (
      <svg className="jc-key" width={12} height={12} viewBox="0 0 12 12" aria-hidden="true">
        <line
          x1={1}
          x2={11}
          y1={6}
          y2={6}
          style={{
            stroke: color,
            strokeWidth: kind === 'line' ? 2 : 3,
            strokeLinecap: 'round',
            strokeDasharray: dash ?? 'none',
          }}
        />
      </svg>
    );
  }
  return (
    <svg className="jc-key" width={10} height={10} viewBox="0 0 10 10" aria-hidden="true">
      <rect width={10} height={10} rx={3} style={{ fill: color }} />
    </svg>
  );
}
