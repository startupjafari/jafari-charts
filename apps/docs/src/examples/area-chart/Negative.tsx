import { AreaChart } from '@startupjafari/charts';
import { temperature } from '../data';

/** The fill grows from zero in both directions; null readings leave gaps. */
export default function Negative() {
  return (
    <AreaChart
      data={temperature}
      xKey="date"
      yKey="astana"
      label="Astana"
      color="var(--jc-series-6)"
      valueFormatter={(v) => `${v.toFixed(1)} °C`}
      yAxis={{ includeZero: true, format: (v) => `${v}°` }}
      height={240}
    />
  );
}
