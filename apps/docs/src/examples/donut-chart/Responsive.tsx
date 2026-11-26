import { DonutChart } from '@jafari/charts';
import { roles } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <DonutChart data={roles} labelKey="role" valueKey="count" height={200} />
    </div>
  );
}
