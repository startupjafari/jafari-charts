import { WaterfallChart } from '@jafari/charts';
import { cashflow } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <WaterfallChart
        data={cashflow}
        xKey="step"
        yKey="value"
        isTotal={(d) => Boolean(d.total)}
        height={220}
      />
    </div>
  );
}
