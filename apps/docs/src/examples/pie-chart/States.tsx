import { PieChart } from '@jafari/charts';
import { devices } from '../data';

export default function States() {
  return (
    <PieChart
      data={devices.slice(0, 0)}
      labelKey="device"
      valueKey="share"
      emptyMessage="No sessions recorded"
      height={220}
    />
  );
}
