import { StackedAreaChart } from '@jafari/charts';
import { registrations } from '../data';

export default function Stepped() {
  return (
    <StackedAreaChart
      data={registrations}
      xKey="month"
      series={[
        { key: 'students', label: 'Students' },
        { key: 'teachers', label: 'Teachers' },
        { key: 'admins', label: 'Admins' },
      ]}
      curve="stepAfter"
      grid={false}
      yAxis={{ hidden: true }}
      height={220}
    />
  );
}
