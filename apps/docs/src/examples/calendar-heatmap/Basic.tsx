import { CalendarHeatmap } from '@startupjafari/charts';
import { dailyLogins } from '../data';

/** One cell per day; weeks are columns. Cells size themselves to the width. */
export default function Basic() {
  return (
    <CalendarHeatmap
      data={dailyLogins}
      dateKey="date"
      valueKey="logins"
      valueLabel="Logins"
      title="Daily logins in 2025"
    />
  );
}
