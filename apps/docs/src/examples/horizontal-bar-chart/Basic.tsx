import { HorizontalBarChart } from '@jafari/charts';
import { universities } from '../data';

/** Long category names are truncated to fit; the full name is in the tooltip. */
export default function Basic() {
  return (
    <HorizontalBarChart
      data={universities}
      xKey="name"
      yKey="score"
      label="Rating"
      title="University ratings"
    />
  );
}
