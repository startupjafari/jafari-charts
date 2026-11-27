import { formatPercent, StackedBarChart } from '@startupjafari/charts';
import { complaints } from '../data';

export default function Percent() {
  return (
    <StackedBarChart
      mode="percent"
      data={complaints}
      xKey="category"
      series={[
        { key: 'open', label: 'Open' },
        { key: 'resolved', label: 'Resolved' },
        { key: 'rejected', label: 'Rejected' },
      ]}
      yAxis={{ format: (v) => formatPercent(v, 'en', 0) }}
      height={240}
    />
  );
}
