import { AreaChart } from '@startupjafari/charts';
import { dailyUsers } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <AreaChart data={dailyUsers} xKey="date" yKey="users" label="Users" height={200} />
    </div>
  );
}
