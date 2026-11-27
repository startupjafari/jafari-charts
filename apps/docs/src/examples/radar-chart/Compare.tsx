import { RadarChart } from '@startupjafari/charts';
import { profiles } from '../data';

/** Several datasets on the same spokes, with a legend that toggles them. */
export default function Compare() {
  return (
    <RadarChart
      data={profiles}
      labelKey="metric"
      series={[
        { key: 'north', label: 'North' },
        { key: 'south', label: 'South' },
        { key: 'east', label: 'East' },
      ]}
      max={100}
    />
  );
}
