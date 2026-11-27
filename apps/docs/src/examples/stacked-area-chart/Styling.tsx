import { StackedAreaChart } from '@startupjafari/charts';
import { registrations } from '../data';

export default function Styling() {
  return (
    <StackedAreaChart
      data={registrations}
      xKey="month"
      series={[
        { key: 'students', label: 'Students', color: '#0EA5E9' },
        { key: 'teachers', label: 'Teachers', color: '#22C55E' },
        { key: 'admins', label: 'Admins', color: '#F59E0B' },
      ]}
      gradient={false}
      curve="linear"
      legend={{ position: 'top', align: 'center' }}
      tooltip={{ sort: 'desc' }}
      height={240}
    />
  );
}
