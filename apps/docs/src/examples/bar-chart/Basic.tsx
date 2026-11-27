import { BarChart } from '@startupjafari/charts';
import { registrations } from '../data';

export default function Basic() {
  return (
    <BarChart
      data={registrations}
      xKey="month"
      yKey="students"
      label="Registrations"
      title="Student registrations per month"
    />
  );
}
