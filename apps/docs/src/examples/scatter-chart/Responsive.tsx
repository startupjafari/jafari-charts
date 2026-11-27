import { ScatterChart } from '@startupjafari/charts';
import { cohort } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <ScatterChart data={cohort} xKey="hours" yKey="grade" groupKey="faculty" height={240} />
    </div>
  );
}
