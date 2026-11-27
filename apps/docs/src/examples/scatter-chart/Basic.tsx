import { ScatterChart } from '@startupjafari/charts';
import { cohort } from '../data';

export default function Basic() {
  return (
    <ScatterChart
      data={cohort}
      xKey="hours"
      yKey="grade"
      labelKey="name"
      xLabel="Study hours / week"
      yLabel="Average grade"
      title="Study hours and grades"
    />
  );
}
