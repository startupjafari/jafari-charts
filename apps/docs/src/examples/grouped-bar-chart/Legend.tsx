import { GroupedBarChart } from '@startupjafari/charts';
import { complaints } from '../data';

/** "Rejected" starts hidden; click legend items to toggle series (the last one stays on). */
export default function Legend() {
  return (
    <GroupedBarChart
      data={complaints}
      xKey="category"
      series={[
        { key: 'open', label: 'Open' },
        { key: 'resolved', label: 'Resolved' },
        { key: 'rejected', label: 'Rejected' },
      ]}
      defaultHiddenSeries={['rejected']}
      legend={{ position: 'top', align: 'center' }}
      tooltip={{ mode: 'item' }}
      height={240}
    />
  );
}
