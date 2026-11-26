import { GroupedBarChart } from '@jafari/charts';
import { complaints } from '../data';

export default function Horizontal() {
  return (
    <GroupedBarChart
      layout="horizontal"
      data={complaints}
      xKey="category"
      series={[
        { key: 'open', label: 'Open' },
        { key: 'resolved', label: 'Resolved' },
      ]}
      labels
      height={320}
    />
  );
}
