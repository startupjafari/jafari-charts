import { CalendarHeatmap } from '@jafari/charts';
import { dailyLogins } from '../data';

export default function States() {
  return (
    <CalendarHeatmap
      data={dailyLogins.slice(0, 0)}
      dateKey="date"
      valueKey="logins"
      emptyMessage="No logins yet"
    />
  );
}
