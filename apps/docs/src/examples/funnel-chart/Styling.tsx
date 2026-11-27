import { formatCompact, FunnelChart } from '@startupjafari/charts';
import { admissions } from '../data';

export default function Styling() {
  return (
    <FunnelChart
      data={admissions}
      labelKey="stage"
      valueKey="count"
      colors={['#6366F1', '#7C3AED', '#9333EA', '#C026D3', '#DB2777']}
      dropOff={false}
      valueFormatter={(v) => formatCompact(v)}
      percentFormatter={(r) => `${(r * 100).toFixed(1)}%`}
    />
  );
}
