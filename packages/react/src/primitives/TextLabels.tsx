import type { TextMark } from '@jafari/charts-core';
import { memo } from 'react';

const BASELINE = { auto: undefined, middle: 'central', hanging: 'hanging' } as const;

/** Text labels (value labels, centre labels). Text never wears the series colour. */
export const TextLabels = memo(function TextLabels({ labels }: { labels: readonly TextMark[] }) {
  if (!labels.length) return null;
  return (
    <g className="jc-labels" aria-hidden="true">
      {labels.map((l) => (
        <text
          key={l.key}
          className="jc-label"
          data-tone={l.tone}
          x={l.x}
          y={l.y}
          textAnchor={l.anchor ?? 'middle'}
          dominantBaseline={BASELINE[l.baseline ?? 'auto']}
          transform={l.rotate ? `rotate(${l.rotate} ${l.x} ${l.y})` : undefined}
          style={{
            ...(l.fill ? { fill: l.fill } : {}),
            ...(l.fontSize ? { fontSize: l.fontSize } : {}),
            ...(l.fontWeight ? { fontWeight: l.fontWeight } : {}),
          }}
        >
          {l.text}
        </text>
      ))}
    </g>
  );
});
