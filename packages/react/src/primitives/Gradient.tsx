import type { LinearGradientPaint } from '@jafari/charts-core';

/** `<linearGradient>` for a gradient paint (user-space coordinates). */
export function GradientDef({ id, paint }: { id: string; paint: LinearGradientPaint }) {
  return (
    <linearGradient
      id={id}
      gradientUnits="userSpaceOnUse"
      x1={paint.x1}
      y1={paint.y1}
      x2={paint.x2}
      y2={paint.y2}
    >
      {paint.stops.map((s, i) => (
        <stop key={i} offset={s.offset} style={{ stopColor: s.color, stopOpacity: s.opacity }} />
      ))}
    </linearGradient>
  );
}
