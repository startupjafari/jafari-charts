import { GroupedBarChart } from '@jafari/charts';
import { complaints } from '../data';

export default function Basic() {
  return (
    <GroupedBarChart
      data={complaints}
      xKey="category"
      series={[
        { key: 'open', label: 'Open' },
        { key: 'resolved', label: 'Resolved' },
        { key: 'rejected', label: 'Rejected' },
      ]}
      title="Complaints by category"
    />
  );
}
