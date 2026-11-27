import { formatPercent, StackedAreaChart } from '@startupjafari/charts';
import { activity } from '../data';

/** Each day is normalised to 100 % — composition rather than volume. */
export default function Percent() {
  return (
    <StackedAreaChart
      mode="percent"
      data={activity}
      xKey="date"
      series={[
        { key: 'students', label: 'Students' },
        { key: 'teachers', label: 'Teachers' },
        { key: 'staff', label: 'Staff' },
      ]}
      yAxis={{ format: (v) => formatPercent(v, 'en', 0) }}
      height={240}
    />
  );
}
