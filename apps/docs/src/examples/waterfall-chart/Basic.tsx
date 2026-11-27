import { WaterfallChart } from '@startupjafari/charts';
import { cashflow } from '../data';

/** The first row is the start; `isTotal` marks running totals (their value is ignored). */
export default function Basic() {
  return (
    <WaterfallChart
      data={cashflow}
      xKey="step"
      yKey="value"
      isTotal={(d) => Boolean(d.total)}
      valueFormatter={(v) => `${v} M ₸`}
      title="Cash flow, Q2"
    />
  );
}
