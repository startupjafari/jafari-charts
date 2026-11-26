import { CalendarHeatmap } from '@jafari/charts';
import { dailyLogins } from '../data';

/** When a year does not fit, cells shrink to a minimum and the most recent weeks are kept. */
export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <CalendarHeatmap data={dailyLogins} dateKey="date" valueKey="logins" />
    </div>
  );
}
