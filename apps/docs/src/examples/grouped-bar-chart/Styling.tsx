import { GroupedBarChart } from '@startupjafari/charts';
import { revenue } from '../data';

export default function Styling() {
  return (
    <GroupedBarChart
      data={revenue.slice(0, 6)}
      xKey="month"
      series={[
        { key: 'revenue', label: 'Revenue', color: '#6366F1' },
        { key: 'costs', label: 'Costs', color: '#CBD5E1' },
      ]}
      barGap={4}
      barRadius={3}
      maxBarSize={16}
      categoryGap={0.4}
      valueFormatter={(v) => `${v} M ₸`}
      legend={{ position: 'top', align: 'end' }}
      height={240}
    />
  );
}
