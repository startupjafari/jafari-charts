import { AreaChart } from '@jafari/charts';
import { dailyUsers } from '../data';

export default function MultiSeries() {
  return (
    <AreaChart
      data={dailyUsers}
      xKey="date"
      series={[
        { key: 'sessions', label: 'Sessions' },
        { key: 'users', label: 'Users' },
      ]}
      height={260}
    />
  );
}
