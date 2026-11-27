import { AreaChart } from '@startupjafari/charts';
import { registrations } from '../data';

export default function Solid() {
  return (
    <AreaChart
      data={registrations}
      xKey="month"
      series={[
        { key: 'students', label: 'Students', color: '#8B5CF6' },
        { key: 'teachers', label: 'Teachers', color: '#06B6D4' },
      ]}
      gradient={false}
      curve="linear"
      dots
      grid={{ vertical: true }}
      height={240}
    />
  );
}
