import { DonutChart, formatCompact, formatPercent } from '@startupjafari/charts';
import { roles } from '../data';

const total = roles.reduce((s, r) => s + r.count, 0);

export default function Center() {
  return (
    <DonutChart
      data={roles}
      labelKey="role"
      valueKey="count"
      centerValue={(active) =>
        active ? formatPercent(active.share, 'en', 0) : formatCompact(total)
      }
      centerLabel={(active) => (active ? active.label : 'users')}
      valueFormatter={(v) => formatCompact(v)}
    />
  );
}
