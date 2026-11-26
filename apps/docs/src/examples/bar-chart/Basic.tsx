import { BarChart } from '@jafari/charts';
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
