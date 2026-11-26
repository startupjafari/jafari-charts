import { RadialProgressChart } from '@jafari/charts';
import { completion } from '../data';

/** Several targets as concentric rings, outermost first, with a legend and tooltip. */
export default function Rings() {
  return <RadialProgressChart data={completion} height={220} title="Course completion" />;
}
