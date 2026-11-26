import { LineChart } from '@jafari/charts';
import { registrations } from '../data';

/** Marker shapes and dash patterns tell series apart without relying on colour. */
export default function Differentiate() {
  return (
    <LineChart
      data={registrations}
      xKey="month"
      series={[
        { key: 'students', label: 'Students' },
        { key: 'teachers', label: 'Teachers' },
        { key: 'admins', label: 'Admins' },
      ]}
      differentiate
      dots
      height={240}
    />
  );
}
