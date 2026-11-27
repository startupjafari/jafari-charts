import { WaterfallChart } from '@startupjafari/charts';
import { cashflow } from '../data';

export default function States() {
  return (
    <WaterfallChart
      data={cashflow.slice(0, 0)}
      xKey="step"
      yKey="value"
      emptyMessage="No transactions in this quarter"
      height={220}
    />
  );
}
