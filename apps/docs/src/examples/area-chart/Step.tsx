import { AreaChart } from '@jafari/charts';
import { serverLoad } from '../data';

const data = serverLoad(72);

export default function Step() {
  return (
    <AreaChart
      data={data}
      xKey="time"
      xAxis={{ type: 'time' }}
      yKey="load"
      label="Load"
      curve="stepAfter"
      color="var(--jc-series-4)"
      valueFormatter={(v) => `${v}%`}
      yAxis={{ min: 0, max: 100, format: (v) => `${v}%` }}
      height={220}
    />
  );
}
