import { LineChart } from '@startupjafari/charts';
import { activity } from '../data';

/** In a 320 px column ticks thin out and the legend wraps; nothing overflows. */
export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <LineChart
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
