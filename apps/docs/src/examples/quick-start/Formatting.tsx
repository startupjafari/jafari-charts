import { BarChart, formatCurrency } from '@startupjafari/charts';
import { revenue } from '../data';

export default function Formatting() {
  return (
    <BarChart
      data={revenue}
      xKey="month"
      yKey="revenue"
      label="Revenue"
      valueFormatter={(v) => formatCurrency(v * 1e6, 'KZT', 'en', { notation: 'compact' })}
      yAxis={{ format: (v) => `${v}M` }}
      height={240}
    />
  );
}
