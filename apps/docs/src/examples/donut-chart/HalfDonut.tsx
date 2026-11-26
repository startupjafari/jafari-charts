import { DonutChart } from '@jafari/charts';
import { devices } from '../data';

export default function HalfDonut() {
  return (
    <DonutChart
      data={devices}
      labelKey="device"
      valueKey="share"
      startAngle={-90}
      endAngle={90}
      thickness={0.28}
      centerLabel="sessions, %"
      height={220}
    />
  );
}
