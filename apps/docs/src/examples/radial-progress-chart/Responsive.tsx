import { RadialProgressChart } from '@startupjafari/charts';
import { completion } from '../data';

/** The rings scale to the smaller of width and height. */
export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <RadialProgressChart data={completion} height={180} />
    </div>
  );
}
