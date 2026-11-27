import { HorizontalBarChart } from '@startupjafari/charts';
import { devices } from '../data';

export default function Styling() {
  return (
    <HorizontalBarChart
      data={devices}
      xKey="device"
      yKey="share"
      label="Share"
      color="var(--jc-series-5)"
      barRadius={6}
      maxBarSize={18}
      valueFormatter={(v) => `${v}%`}
      yAxis={false}
      grid={false}
    />
  );
}
