import { memo } from 'react';
import { useStoreSelector } from '../hooks/useStoreSelector';
import { useChart, type InteractionState } from '../providers/ChartContext';

export interface DataTable {
  columns: string[];
  rows: string[][];
}

/** Visually hidden data table: the text equivalent of the chart for assistive technology. */
export const ChartDataTable = memo(function ChartDataTable({
  table,
  caption,
  limit,
}: {
  table: DataTable;
  caption: string;
  limit: number;
}) {
  if (!table.rows.length) return null;
  const rows = table.rows.slice(0, limit);
  // Tables ignore `width: 1px`, so the visually hidden wrapper does the clipping
  // (otherwise wide tables extend the page's scroll width).
  return (
    <div className="jc-sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {table.columns.map((c, i) => (
              <th key={i} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const selectAnnouncement = (s: InteractionState) =>
  s.source === 'keyboard' && s.active ? `${s.active.position}:${s.active.series}` : '';

/** Polite live region announcing values during keyboard navigation. */
export function ChartLiveRegion() {
  const { store, adapter } = useChart();
  const key = useStoreSelector(store, selectAnnouncement);
  const active = key ? store.getState().active : null;
  const data = active ? adapter.tooltip(active) : null;
  const text = data
    ? [data.title, ...data.rows.map((r) => `${r.label}: ${r.value}`)].filter(Boolean).join(', ')
    : '';
  return (
    <div className="jc-sr-only" aria-live="polite" aria-atomic="true">
      {text}
    </div>
  );
}
