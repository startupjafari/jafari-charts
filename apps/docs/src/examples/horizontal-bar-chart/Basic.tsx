import { HorizontalBarChart } from '@startupjafari/charts';
import { universities } from '../data';

/** Long category names wrap onto two lines; the full name is in the tooltip. */
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
