import { ChartReferenceLine, LineChart } from '@jafari/charts';
import { activity } from '../data';

export default function MultiSeries() {
  return (
    <LineChart
      data={activity}
      xKey="date"
      series={[
        { key: 'students', label: 'Students' },
        { key: 'teachers', label: 'Teachers' },
        { key: 'staff', label: 'Staff' },
      ]}
      title="Platform activity by role"
    >
      <ChartReferenceLine y={400} label="Target" />
    </LineChart>
  );
}
