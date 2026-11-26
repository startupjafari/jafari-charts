import { HeatmapChart } from '@jafari/charts';
import { sessionsByHour } from '../data';

/** A custom colour ramp with explicit thresholds, wider gaps and rounded cells. */
export default function Styling() {
  return (
    <HeatmapChart
      data={sessionsByHour}
      xKey="hour"
      yKey="day"
      valueKey="sessions"
      colors={['#ECFEFF', '#A5F3FC', '#22D3EE', '#0891B2', '#164E63']}
      thresholds={[60, 120, 200, 300]}
      gap={4}
      cornerRadius={6}
      xAxis={{ title: 'hour' }}
      legend={{ position: 'top', align: 'end' }}
      height={300}
    />
  );
}
