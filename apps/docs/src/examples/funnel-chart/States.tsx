import { FunnelChart } from '@startupjafari/charts';
import { admissions } from '../data';

export default function States() {
  return (
    <FunnelChart
      data={admissions.slice(0, 0)}
      labelKey="stage"
      valueKey="count"
      emptyMessage="The campaign has not started"
    />
  );
}
