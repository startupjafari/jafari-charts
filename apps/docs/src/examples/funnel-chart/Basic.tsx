import { FunnelChart } from '@startupjafari/charts';
import { admissions } from '../data';

/** Each stage shows its value and share of the first stage; drop-off labels sit between stages. */
export default function Basic() {
  return (
    <FunnelChart data={admissions} labelKey="stage" valueKey="count" title="Admissions 2025" />
  );
}
