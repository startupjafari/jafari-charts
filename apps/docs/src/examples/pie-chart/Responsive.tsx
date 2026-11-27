import { PieChart } from '@startupjafari/charts';
import { devices } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <PieChart data={devices} labelKey="device" valueKey="share" height={200} />
    </div>
  );
}
