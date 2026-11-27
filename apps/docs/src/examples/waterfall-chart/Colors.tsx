import { WaterfallChart } from '@startupjafari/charts';
import { cashflow } from '../data';

export default function Colors() {
  return (
    <WaterfallChart
      data={cashflow}
      xKey="step"
      yKey="value"
      isTotal={(d) => Boolean(d.total)}
      colors={{ increase: '#14B8A6', decrease: '#F97316', total: '#64748B' }}
      connectors={false}
      barRadius={2}
      height={260}
    />
  );
}
