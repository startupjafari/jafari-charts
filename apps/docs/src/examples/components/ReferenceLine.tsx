import { ChartReferenceLine, LineChart } from '@jafari/charts';
import { dailyUsers } from '../data';

export default function ReferenceLine() {
  return (
    <LineChart data={dailyUsers} xKey="date" yKey="users" label="Users" height={260}>
      <ChartReferenceLine y={2000} label="Goal" />
      <ChartReferenceLine y={1500} label="Last year" labelPosition="start" dashed={false} />
      <ChartReferenceLine x="2025-03-01" label="Spring term" color="var(--jc-series-3)" />
    </LineChart>
  );
}
