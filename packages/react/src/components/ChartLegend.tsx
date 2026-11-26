import type { ReactNode } from 'react';
import { useChart, type SeriesInfo } from '../providers/ChartContext';
import { SeriesKey } from './SeriesKey';

export interface LegendOptions {
  position?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  /** Clicking an item toggles the series (default true). */
  interactive?: boolean;
  /** Custom legend renderer. */
  render?: (items: SeriesInfo[], toggle: (id: string) => void) => ReactNode;
}

/**
 * Compact legend that wraps onto more lines on narrow screens. Items are real
 * buttons (`aria-pressed`) and highlight their series on hover and focus.
 */
export function ChartLegend({
  position = 'bottom',
  align = 'start',
  interactive = true,
  render,
}: LegendOptions) {
  const { series, toggleSeries, store, messages } = useChart();
  if (render) return <>{render(series, toggleSeries)}</>;
  const visibleCount = series.filter((s) => s.visible).length;
  const highlight = (index: number | null) => store.setState({ highlight: index });
  return (
    <ul
      className="jc-legend"
      data-position={position}
      data-align={align}
      aria-label={messages.legend}
    >
      {series.map((s, i) => {
        const locked = s.visible && visibleCount <= 1;
        return (
          <li key={s.id} style={{ display: 'contents' }}>
            <button
              type="button"
              className="jc-legend-item"
              aria-pressed={s.visible}
              aria-label={interactive ? messages.toggleSeries(s.label, s.visible) : s.label}
              disabled={!interactive || locked}
              onClick={() => toggleSeries(s.id)}
              onPointerEnter={() => s.visible && highlight(i)}
              onPointerLeave={() => highlight(null)}
              onFocus={() => s.visible && highlight(i)}
              onBlur={() => highlight(null)}
            >
              <SeriesKey
                color={s.color}
                kind={s.kind}
                symbol={s.symbol}
                {...(s.dash ? { dash: s.dash } : {})}
              />
              <span className="jc-legend-text">{s.label}</span>
              {s.value !== undefined ? <span className="jc-legend-value">{s.value}</span> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
