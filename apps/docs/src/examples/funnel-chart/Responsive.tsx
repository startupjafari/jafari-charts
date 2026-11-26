import { FunnelChart } from '@jafari/charts';
import { admissions } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <FunnelChart data={admissions} labelKey="stage" valueKey="count" />
    </div>
  );
}
