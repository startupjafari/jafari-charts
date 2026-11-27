import { GroupedBarChart } from '@startupjafari/charts';
import { complaints } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <GroupedBarChart
        data={complaints}
        xKey="category"
        series={[
          { key: 'open', label: 'Open' },
          { key: 'resolved', label: 'Resolved' },
          { key: 'rejected', label: 'Rejected' },
        ]}
        height={220}
      />
    </div>
  );
}
