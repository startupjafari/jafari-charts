import { FunnelChart } from '@jafari/charts';
import { admissions } from '../data';

/** Stages left to right; percentages relative to the previous stage (step conversion). */
export default function Horizontal() {
  return (
    <FunnelChart
      data={admissions}
      labelKey="stage"
      valueKey="count"
      orientation="horizontal"
      percentBase="previous"
    />
  );
}
