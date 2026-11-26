import { ScatterChart } from '@jafari/charts';
import { cohort } from '../data';

/** `sizeKey` makes a bubble chart: bubble area is proportional to the value. */
export default function Bubbles() {
  return (
    <ScatterChart
      data={cohort.slice(0, 45)}
      xKey="hours"
      yKey="grade"
      sizeKey="credits"
      groupKey="faculty"
      labelKey="name"
      xLabel="Study hours"
      yLabel="Grade"
      sizeLabel="Credits"
      height={300}
    />
  );
}
