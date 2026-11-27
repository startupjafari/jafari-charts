import { WaterfallChart } from '@startupjafari/charts';
import { profit } from '../data';

/** With `firstIsStart={false}` every row is a change starting from zero. */
export default function Deltas() {
  return (
    <WaterfallChart
      data={profit}
      xKey="quarter"
      yKey="change"
      firstIsStart={false}
      labels={false}
      height={240}
    />
  );
}
