import { Sparkline } from '@jafari/charts';
import { dailyUsers } from '../data';

/** An empty sparkline keeps its 40 px footprint. */
export default function States() {
  return (
    <div style={{ maxWidth: 280 }}>
      <Sparkline
        data={dailyUsers.slice(0, 0)}
        xKey="date"
        yKey="users"
        emptyMessage="No data yet"
      />
    </div>
  );
}
