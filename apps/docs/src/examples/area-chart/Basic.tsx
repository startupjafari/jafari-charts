import { AreaChart } from '@startupjafari/charts';
import { dailyUsers } from '../data';

export default function Basic() {
  return (
    <AreaChart
      data={dailyUsers}
      xKey="date"
      yKey="users"
      label="Active users"
      title="Daily active users"
    />
  );
}
