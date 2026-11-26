import { HeatmapChart } from '@jafari/charts';
import { enrolmentChange } from '../data';

/** Signed data on a diverging scale around zero, with value labels. */
export default function Diverging() {
  return (
    <HeatmapChart
      data={enrolmentChange}
      xKey="term"
      yKey="faculty"
      valueKey="change"
      colorScale="diverging"
      midpoint={0}
      labels
      valueFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
      valueLabel="Change"
      height={260}
    />
  );
}
