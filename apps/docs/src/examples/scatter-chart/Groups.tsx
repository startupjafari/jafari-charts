import { ScatterChart } from '@jafari/charts';
import { cohort } from '../data';

/** `groupKey` splits long data into groups, each with its own colour and legend item. */
export default function Groups() {
  return (
    <ScatterChart
      data={cohort}
      xKey="hours"
      yKey="grade"
      groupKey="faculty"
      labelKey="name"
      xLabel="Study hours / week"
      yLabel="Average grade"
      height={300}
    />
  );
}
