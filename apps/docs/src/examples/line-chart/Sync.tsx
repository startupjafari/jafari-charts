import { AreaChart, LineChart } from '@startupjafari/charts';
import { dailyUsers } from '../data';

/** Hover either chart: both show the crosshair and tooltip at the same date. */
export default function Sync() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <LineChart
        data={dailyUsers}
        xKey="date"
        yKey="users"
        label="Users"
        syncId="traffic"
        height={180}
      />
      <AreaChart
        data={dailyUsers}
        xKey="date"
        yKey="sessions"
        label="Sessions"
        color="var(--jc-series-2)"
        syncId="traffic"
        height={180}
      />
    </div>
  );
}
