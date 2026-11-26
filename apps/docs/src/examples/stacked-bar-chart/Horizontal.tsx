import { StackedBarChart } from '@jafari/charts';
import { complaints } from '../data';

export default function Horizontal() {
  return (
    <StackedBarChart
      layout="horizontal"
      data={complaints}
      xKey="category"
      series={[
        { key: 'open', label: 'Open' },
        { key: 'resolved', label: 'Resolved' },
        { key: 'rejected', label: 'Rejected' },
      ]}
      height={260}
    />
  );
}
