import { StackedBarChart } from '@startupjafari/charts';
import { complaints } from '../data';

export default function Styling() {
  return (
    <StackedBarChart
      data={complaints}
      xKey="category"
      series={[
        { key: 'resolved', label: 'Resolved', color: '#10B981' },
        { key: 'open', label: 'Open', color: '#FBBF24' },
        { key: 'rejected', label: 'Rejected', color: '#F87171' },
      ]}
      barRadius={8}
      maxBarSize={36}
      categoryGap={0.5}
      legend={{ position: 'top', align: 'center' }}
      height={260}
    />
  );
}
