import { CalendarHeatmap } from '@startupjafari/charts';
import { dailyLogins } from '../data';

/** A different hue, explicit thresholds, month gaps, all weekday labels and larger cells. */
export default function Styling() {
  return (
    <CalendarHeatmap
      data={dailyLogins}
      dateKey="date"
      valueKey="logins"
      from="2025-09-01"
      to="2025-12-31"
      color="#16A34A"
      thresholds={[40, 100, 160, 220]}
      monthGap
      cellSize={18}
      weekdayLabels="all"
      weekStartsOn={1}
    />
  );
}
