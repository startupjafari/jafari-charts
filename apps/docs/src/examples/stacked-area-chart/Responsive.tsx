import { StackedAreaChart } from '@jafari/charts';
import { activity } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <StackedAreaChart
        data={activity}
        xKey="date"
        series={[
          { key: 'students', label: 'Students' },
          { key: 'teachers', label: 'Teachers' },
          { key: 'staff', label: 'Staff' },
        ]}
        height={220}
      />
    </div>
  );
}
