import { StackedAreaChart } from '@jafari/charts';
import { activity } from '../data';

export default function Basic() {
  return (
    <StackedAreaChart
      data={activity}
      xKey="date"
      series={[
        { key: 'students', label: 'Students' },
        { key: 'teachers', label: 'Teachers' },
        { key: 'staff', label: 'Staff' },
      ]}
      title="Activity by role"
    />
  );
}
