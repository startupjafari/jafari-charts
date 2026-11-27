import { ComboChart } from '@startupjafari/charts';
import { revenue } from '../data';

export default function Mixed() {
  return (
    <ComboChart
      data={revenue}
      xKey="month"
      series={[
        { key: 'costs', label: 'Costs', type: 'area' },
        { key: 'revenue', label: 'Revenue', type: 'bar' },
        { key: 'margin', label: 'Margin %', type: 'line', axis: 'right', dashed: true, dots: true },
      ]}
      height={260}
    />
  );
}
