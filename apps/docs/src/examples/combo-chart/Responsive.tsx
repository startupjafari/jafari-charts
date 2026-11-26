import { ComboChart } from '@jafari/charts';
import { revenue } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <ComboChart
        data={revenue}
        xKey="month"
        series={[
          { key: 'revenue', label: 'Revenue', type: 'bar' },
          { key: 'margin', label: 'Margin', type: 'line', axis: 'right' },
        ]}
        height={220}
      />
    </div>
  );
}
