import { HorizontalBarChart } from '@startupjafari/charts';
import { complaints } from '../data';

/** Without value labels the value axis carries the scale. */
export default function NoLabels() {
  return (
    <HorizontalBarChart
      data={complaints}
      xKey="category"
      yKey="resolved"
      label="Resolved"
      labels={false}
      grid={{ vertical: true, horizontal: false }}
      color="var(--jc-series-2)"
    />
  );
}
