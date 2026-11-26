import { Sparkline } from '@jafari/charts';
import { dailyUsers } from '../data';

/** Tooltip and crosshair are off by default; turn them on when the exact value matters. */
export default function Tooltip() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Sparkline
        data={dailyUsers.slice(-30)}
        xKey="date"
        yKey="users"
        label="Users"
        tooltip
        crosshair
        dots
        height={64}
        title="Users, last 30 days"
      />
    </div>
  );
}
