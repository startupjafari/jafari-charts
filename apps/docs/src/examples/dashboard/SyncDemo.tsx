import { AreaChart, LineChart } from '@jafari/charts';
import { activity } from '../data';

/**
 * Charts with the same `syncId` share the active date: hover (or focus and use
 * the arrow keys on) either chart and both show the crosshair and tooltip.
 */
export default function SyncDemo() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <LineChart
        data={activity}
        xKey="date"
        series={[
          { key: 'students', label: 'Students' },
          { key: 'teachers', label: 'Teachers' },
        ]}
        syncId="university-activity"
        legend={{ position: 'top' }}
        height={200}
      />
      <AreaChart
        data={activity}
        xKey="date"
        yKey="staff"
        label="Staff"
        color="var(--jc-series-3)"
        syncId="university-activity"
        height={150}
      />
    </div>
  );
}
