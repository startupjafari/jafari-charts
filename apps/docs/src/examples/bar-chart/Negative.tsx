import { BarChart } from '@jafari/charts';
import { profit } from '../data';

/** Negative values grow downwards from an emphasised zero line; labels sit at the bar ends. */
export default function Negative() {
  return (
    <BarChart
      data={profit}
      xKey="quarter"
      yKey="change"
      label="Profit change"
      labels
      valueFormatter={(v) => `${v > 0 ? '+' : ''}${v} M ₸`}
      height={260}
    />
  );
}
