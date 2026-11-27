import { ComboChart } from '@startupjafari/charts';
import { revenue } from '../data';

export default function States() {
  return (
    <ComboChart
      data={revenue}
      xKey="month"
      series={[
        { key: 'revenue', label: 'Revenue', type: 'bar' },
        { key: 'margin', label: 'Margin', type: 'line', axis: 'right' },
      ]}
      loading
      height={220}
      description="Previous data stays visible, dimmed, while a refresh is in flight."
    />
  );
}
