import { HeatmapChart } from '@jafari/charts';
import { sessionsByHour } from '../data';

/** Rows are weekdays, columns hours; colour steps encode the number of sessions. */
export default function Basic() {
  return (
    <HeatmapChart
      data={sessionsByHour}
      xKey="hour"
      yKey="day"
      valueKey="sessions"
      valueLabel="Sessions"
      title="Sessions by weekday and hour"
    />
  );
}
