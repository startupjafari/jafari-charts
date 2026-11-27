import { ChartReferenceLine, ComboChart } from '@startupjafari/charts';
import { registrations } from '../data';

export default function Styling() {
  return (
    <ComboChart
      data={registrations}
      xKey="month"
      series={[
        { key: 'students', label: 'Students', type: 'bar', color: '#A78BFA' },
        {
          key: 'teachers',
          label: 'Teachers',
          type: 'line',
          color: '#F97316',
          curve: 'linear',
          dots: true,
        },
      ]}
      barRadius={6}
      maxBarSize={28}
      yAxis={{ title: 'people' }}
      legend={{ position: 'top' }}
      height={260}
    >
      <ChartReferenceLine y={200} label="Capacity" labelPosition="start" />
    </ComboChart>
  );
}
