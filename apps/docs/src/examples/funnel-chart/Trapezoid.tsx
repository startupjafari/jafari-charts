import { FunnelChart } from '@jafari/charts';
import { admissions } from '../data';

export default function Trapezoid() {
  return <FunnelChart data={admissions} labelKey="stage" valueKey="count" variant="trapezoid" />;
}
