import { CalendarHeatmap } from '@startupjafari/charts';
import { dailyLogins } from '../data';

/** Russian month and weekday names; weeks start on Monday for ru and kk. */
export default function Localized() {
  return (
    <CalendarHeatmap
      data={dailyLogins}
      dateKey="date"
      valueKey="logins"
      valueLabel="Входы"
      locale="ru"
      legend={{ lessLabel: 'Меньше', moreLabel: 'Больше' }}
    />
  );
}
