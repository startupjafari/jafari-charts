import { StackedBarChart } from '@jafari/charts';
import { registrations } from '../data';

export default function States() {
  return (
    <StackedBarChart
      data={registrations.filter(() => false)}
      xKey="month"
      series={[
        { key: 'students', label: 'Students' },
        { key: 'teachers', label: 'Teachers' },
      ]}
      emptyMessage="No registrations yet this year"
      height={220}
    />
  );
}
