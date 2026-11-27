import { StackedBarChart } from '@startupjafari/charts';
import { registrations } from '../data';

export default function Basic() {
  return (
    <StackedBarChart
      data={registrations}
      xKey="month"
      series={[
        { key: 'students', label: 'Students' },
        { key: 'teachers', label: 'Teachers' },
        { key: 'admins', label: 'Admins' },
      ]}
      title="Registrations by role"
    />
  );
}
