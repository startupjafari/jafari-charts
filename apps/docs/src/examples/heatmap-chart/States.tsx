import { HeatmapChart } from '@jafari/charts';
import { sessionsByHour } from '../data';

export default function States() {
  return (
    <HeatmapChart
      data={sessionsByHour.slice(0, 0)}
      xKey="hour"
      yKey="day"
      valueKey="sessions"
      emptyMessage="No sessions recorded this week"
      height={220}
    />
  );
}
