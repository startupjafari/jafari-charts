import { ChartAnnotation, ChartLabel, ChartMarker, LineChart, useChart } from '@jafari/charts';
import { dailyUsers } from '../data';

/**
 * A custom primitive: `useChart()` exposes the chart's scales and plot area,
 * so data values can be turned into pixels for ChartAnnotation, ChartMarker and ChartLabel.
 */
function Lowest() {
  const { frame, plot } = useChart();
  if (!frame || frame.x.kind !== 'time' || frame.y.kind !== 'linear') return null;
  const low = dailyUsers.reduce((best, d) => (d.users < best.users ? d : best));
  const x = frame.x.map(Date.parse(low.date));
  const y = frame.y.map(low.users);
  return (
    <>
      <ChartMarker x={x} y={y} shape="diamond" size={11} color="var(--jc-negative)" />
      <ChartAnnotation x={x} y={y} dx={24} dy={-28}>
        Lowest: {low.users}
      </ChartAnnotation>
      <ChartLabel x={plot.x + plot.width} y={plot.y + 4} anchor="end" tone="muted">
        Source: platform logs
      </ChartLabel>
    </>
  );
}

export default function Annotations() {
  return (
    <LineChart data={dailyUsers} xKey="date" yKey="users" label="Users" height={260}>
      <Lowest />
    </LineChart>
  );
}
