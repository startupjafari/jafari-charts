import { PieChart } from '@jafari/charts';
import { devices } from '../data';

/** Outside labels with leader lines replace the legend. */
export default function Outside() {
  return (
    <PieChart
      data={devices}
      labelKey="device"
      valueKey="share"
      labels="outside"
      legend={false}
      height={280}
    />
  );
}
