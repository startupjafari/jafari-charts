import { StackedBarChart } from '@jafari/charts';
import { registrations } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <StackedBarChart
        data={registrations}
        xKey="month"
        series={[
          { key: 'students', label: 'Students' },
          { key: 'teachers', label: 'Teachers' },
          { key: 'admins', label: 'Admins' },
        ]}
        height={220}
      />
    </div>
  );
}
