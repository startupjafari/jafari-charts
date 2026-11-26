import { AreaChart } from '@jafari/charts';
import { dailyUsers } from '../data';

export default function Hero() {
  return (
    <AreaChart
      data={dailyUsers}
      xKey="date"
      series={[
        { key: 'sessions', label: 'Sessions' },
        { key: 'users', label: 'Active users' },
      ]}
      legend={{ position: 'top', align: 'end' }}
      height={300}
      title="Sessions and active users, last 120 days"
    />
  );
}
