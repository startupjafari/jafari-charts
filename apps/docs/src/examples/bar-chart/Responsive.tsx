import { BarChart } from '@startupjafari/charts';
import { registrations } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <BarChart data={registrations} xKey="month" yKey="students" label="Students" height={200} />
    </div>
  );
}
