import { DonutChart } from '@startupjafari/charts';
import { roles } from '../data';

/** The centre shows the total, or the hovered slice. */
export default function Basic() {
  return <DonutChart data={roles} labelKey="role" valueKey="count" title="Users by role" />;
}
