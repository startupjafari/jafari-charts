import { RadarChart } from '@startupjafari/charts';
import { profiles } from '../data';

export default function Basic() {
  return (
    <RadarChart
      data={profiles}
      labelKey="metric"
      series={[{ key: 'north', label: 'North University' }]}
      title="University profile"
    />
  );
}
