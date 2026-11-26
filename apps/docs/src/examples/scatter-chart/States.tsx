import { ScatterChart } from '@jafari/charts';
import { cohort } from '../data';

export default function States() {
  return (
    <ScatterChart
      data={cohort.slice(0, 0)}
      xKey="hours"
      yKey="grade"
      emptyMessage="No students match the filters"
      height={220}
    />
  );
}
