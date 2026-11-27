import { AreaChart, ChartGradient, ChartLabel, useChart } from '@startupjafari/charts';
import { useId } from 'react';
import { dailyUsers } from '../data';

/** A forecast zone painted with a horizontal ChartGradient. */
function Forecast({ from }: { from: string }) {
  const { frame, plot } = useChart();
  const id = `forecast-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  if (!frame || frame.x.kind !== 'time') return null;
  const x = frame.x.map(Date.parse(from));
  return (
    <>
      <ChartGradient id={id} color="var(--jc-series-3)" from={0} to={0.28} direction="horizontal" />
      <rect
        x={x}
        y={plot.y}
        width={plot.x + plot.width - x}
        height={plot.height}
        fill={`url(#${id})`}
      />
      <ChartLabel x={x + 6} y={plot.y + 12} anchor="start" tone="primary">
        Forecast
      </ChartLabel>
    </>
  );
}

export default function Gradient() {
  return (
    <AreaChart data={dailyUsers} xKey="date" yKey="sessions" label="Sessions" height={260}>
      <Forecast from="2025-04-01" />
    </AreaChart>
  );
}
