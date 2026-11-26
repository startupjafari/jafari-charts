import { useCallback, useRef, type ReactNode } from 'react';
import { useStoreSelector } from '../hooks/useStoreSelector';
import { useIsomorphicLayoutEffect } from '../internal/env';
import {
  useChart,
  type ActiveItem,
  type InteractionState,
  type TooltipData,
} from '../providers/ChartContext';
import { SeriesKey } from './SeriesKey';

export interface TooltipOptions {
  /** `shared`: every series at the active position; `item`: only the series under the pointer. */
  mode?: 'shared' | 'item';
  /** Custom content. Receives the default rows and the active item. */
  render?: (data: TooltipData, active: ActiveItem) => ReactNode;
  /** Row order. */
  sort?: 'none' | 'asc' | 'desc';
  /** Hide rows without a value. */
  hideEmpty?: boolean;
  /** Distance from the anchor, px. */
  offset?: number;
}

const selectKey = (s: InteractionState) =>
  s.active ? `${s.active.position}:${s.active.series}` : '';

function sortRows(
  data: TooltipData,
  sort: TooltipOptions['sort'],
  hideEmpty: boolean,
): TooltipData {
  let rows = hideEmpty ? data.rows.filter((r) => r.value !== '—') : data.rows;
  if (sort && sort !== 'none') {
    const num = (v: string) => {
      const n = Number(v.replace(/[^\d.,-]/g, '').replace(',', '.'));
      return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
    };
    rows = [...rows].sort((a, b) =>
      sort === 'desc' ? num(b.value) - num(a.value) : num(a.value) - num(b.value),
    );
  }
  return rows === data.rows ? data : { ...data, rows };
}

/**
 * HTML tooltip. Content renders only when the active item changes; its position
 * follows the pointer through a direct style update, so moving the mouse never
 * re-renders React components or resizes the container.
 */
export function ChartTooltip({
  render,
  sort = 'none',
  hideEmpty = false,
  offset = 14,
}: TooltipOptions) {
  const chart = useChart();
  const { store, adapter, width, height } = chart;
  const key = useStoreSelector(store, selectKey);
  const ref = useRef<HTMLDivElement>(null);
  const active = key ? store.getState().active : null;
  const raw = active ? adapter.tooltip(active) : null;
  const data = raw ? sortRows(raw, sort, hideEmpty) : null;

  const place = useCallback(() => {
    const el = ref.current;
    const s = store.getState();
    if (!el || !s.active) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const ax = s.active.x;
    const ay = s.source === 'pointer' && s.pointer ? s.pointer.y : s.active.y;
    let x = ax + offset;
    if (x + w > width) x = ax - offset - w;
    if (x < 0) x = Math.max(0, Math.min(width - w, ax - w / 2));
    let y = s.source === 'touch' ? ay - h - 24 : ay - h / 2;
    y = Math.max(-8, Math.min(height - h + 8, y));
    el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  }, [store, width, height, offset]);

  useIsomorphicLayoutEffect(() => {
    place();
    return store.subscribe(place);
  }, [place, key]);

  return (
    <div ref={ref} className="jc-tooltip" data-visible={data ? 'true' : 'false'} aria-hidden="true">
      {data && active ? (
        render ? (
          render(data, active)
        ) : (
          <>
            {data.title ? <div className="jc-tooltip-title">{data.title}</div> : null}
            <div className="jc-tooltip-rows">
              {data.rows.map((r) => (
                <div
                  key={r.key}
                  className="jc-tooltip-row"
                  data-active={r.active ? 'true' : undefined}
                  style={{ display: 'contents' }}
                >
                  <span className="jc-tooltip-key">
                    <SeriesKey
                      color={r.color}
                      kind={r.kind}
                      variant="tooltip"
                      {...(r.symbol ? { symbol: r.symbol } : {})}
                      {...(r.dash ? { dash: r.dash } : {})}
                    />
                  </span>
                  <span className="jc-tooltip-label">{r.label}</span>
                  <span className="jc-tooltip-value">{r.value}</span>
                </div>
              ))}
            </div>
            {data.footer ? <div className="jc-tooltip-footer">{data.footer}</div> : null}
          </>
        )
      ) : null}
    </div>
  );
}
