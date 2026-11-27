import { batchMarks, markPath, isStrokeMark, type Mark } from '@startupjafari/charts-core';
import { memo, useMemo } from 'react';
import { GradientDef } from './Gradient';
import { isGradient, markStyle, safeId } from './paint';

export interface SeriesLayerProps {
  marks: readonly Mark[];
  /** Chart instance id, used to keep gradient ids unique per chart. */
  chartId: string;
  clipPath?: string;
  className?: string;
  /** Series to keep emphasised (others dimmed); -2 dims every series; null dims nothing. */
  dim?: number | null;
}

/**
 * Static data layer of the SVG renderer. Marks are grouped per series (so a
 * legend highlight can dim whole series with one CSS rule) and same-style marks
 * are merged into one `<path>`; a 365-bar chart renders a handful of elements.
 * Memoised: pointer movement never re-renders it.
 */
export const SeriesLayer = memo(function SeriesLayer({
  marks,
  chartId,
  clipPath,
  className,
  dim = null,
}: SeriesLayerProps) {
  const groups = useMemo(() => {
    const bySeries = new Map<number, Mark[]>();
    for (const m of marks) {
      const k = m.series ?? -1;
      const g = bySeries.get(k);
      if (g) g.push(m);
      else bySeries.set(k, [m]);
    }
    return [...bySeries].map(([series, ms]) => ({ series, batches: batchMarks(ms) }));
  }, [marks]);

  const gradientId = (key: string) => `${chartId}-g-${safeId(key)}`;

  return (
    <g className={className} clipPath={clipPath}>
      <defs>
        {groups.flatMap((g) =>
          g.batches
            .filter((b) => isGradient(b.style.fill))
            .map((b) => (
              <GradientDef key={b.key} id={gradientId(b.key)} paint={b.style.fill as never} />
            )),
        )}
      </defs>
      {groups.map((g) => (
        <g
          key={g.series}
          className="jc-series"
          data-jc-series={g.series}
          data-jc-dim={
            dim === -2 || (dim !== null && dim >= 0 && dim !== g.series) ? '' : undefined
          }
        >
          {g.batches.map((b) => (
            <path
              key={b.key}
              d={b.d}
              style={markStyle(
                b.style,
                b.stroked,
                isGradient(b.style.fill) ? `url(#${gradientId(b.key)})` : undefined,
              )}
            />
          ))}
        </g>
      ))}
    </g>
  );
});

/** Renders marks one element each (used for the small set of active/highlight marks). */
export function MarkList({ marks, chartId }: { marks: readonly Mark[]; chartId: string }) {
  return (
    <>
      {marks.map((m) => {
        const stroked = isStrokeMark(m);
        const gid = isGradient(m.fill) ? `${chartId}-ag-${safeId(m.key)}` : undefined;
        return (
          <g key={m.key}>
            {gid && isGradient(m.fill) ? (
              <defs>
                <GradientDef id={gid} paint={m.fill} />
              </defs>
            ) : null}
            <path d={markPath(m)} style={markStyle(m, stroked, gid ? `url(#${gid})` : undefined)} />
          </g>
        );
      })}
    </>
  );
}
