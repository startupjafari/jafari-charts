import { GroupedBarChart } from '@startupjafari/charts';
import { complaints } from '../data';

/** Value labels instead of a value axis. */
export default function Labels() {
  return (
    <GroupedBarChart
      data={complaints}
      xKey="category"
      series={[
        { key: 'open', label: 'Open', color: 'var(--jc-warning)' },
        { key: 'resolved', label: 'Resolved', color: 'var(--jc-positive)' },
      ]}
      labels
      yAxis={{ hidden: true }}
      grid={false}
      height={240}
    />
  );
}
