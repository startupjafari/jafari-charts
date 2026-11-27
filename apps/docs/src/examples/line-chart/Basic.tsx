import { LineChart } from '@startupjafari/charts';
import { dailyUsers } from '../data';

export default function Basic() {
  return (
    <LineChart
      data={dailyUsers}
      xKey="date"
      yKey="users"
      label="Active users"
      title="Daily active users"
    />
  );
}
