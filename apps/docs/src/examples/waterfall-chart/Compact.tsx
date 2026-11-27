import { WaterfallChart } from '@startupjafari/charts';
import { cashflow } from '../data';

export default function Compact() {
  return (
    <WaterfallChart
      data={cashflow}
      xKey="step"
      yKey="value"
      isTotal={(d) => Boolean(d.total)}
      valueFormatter={(v) => `${v > 0 ? '+' : ''}${v}`}
      yAxis={{ hidden: true }}
      grid={false}
      barRadius={0}
      categoryGap={0.15}
      height={220}
    />
  );
}
