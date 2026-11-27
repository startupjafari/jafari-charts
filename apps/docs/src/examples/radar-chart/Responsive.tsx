import { RadarChart } from '@startupjafari/charts';
import { profiles } from '../data';

/** Long spoke labels are placed around the chart and truncated to fit. */
export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <RadarChart
        data={profiles}
        labelKey="metric"
        series={[
          { key: 'north', label: 'North' },
          { key: 'south', label: 'South' },
        ]}
        height={260}
      />
    </div>
  );
}
