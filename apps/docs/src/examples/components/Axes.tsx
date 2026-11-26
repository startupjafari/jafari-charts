import { ChartGrid, ChartMarker, ChartStyles, XAxis, YAxis } from '@jafari/charts';

/**
 * Axis and grid primitives also work outside a chart: pass `ticks` and `plot`
 * explicitly. The `jc-root` wrapper provides the theme tokens (--jc-*).
 */
const plot = { x: 36, y: 12, width: 420, height: 150 };
const points = [12, 28, 22, 41, 36, 48];
const x = (i: number) => plot.x + (i + 0.5) * (plot.width / points.length);
const y = (v: number) => plot.y + plot.height - (v / 50) * plot.height;

const xTicks = points.map((_, i) => ({
  value: i,
  position: x(i),
  label: `W${i + 1}`,
  anchor: 'middle' as const,
}));
const yTicks = [0, 25, 50].map((v) => ({
  value: v,
  position: y(v),
  label: String(v),
  anchor: 'middle' as const,
}));

export default function Axes() {
  return (
    <div className="jc-root" data-jc-theme="auto">
      <ChartStyles />
      <svg
        viewBox="0 0 470 190"
        style={{ display: 'block', width: '100%', maxWidth: 470 }}
        role="img"
        aria-label="Weekly submissions, 6 weeks"
      >
        <ChartGrid plot={plot} yTicks={yTicks} xTicks={xTicks} vertical />
        <XAxis plot={plot} ticks={xTicks} line />
        <YAxis plot={plot} ticks={yTicks} title="submissions" />
        {points.map((v, i) => (
          <ChartMarker key={i} x={x(i)} y={y(v)} color="var(--jc-series-1)" size={9} />
        ))}
      </svg>
    </div>
  );
}
