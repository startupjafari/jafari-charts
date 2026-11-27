import { ComboChart } from '@startupjafari/charts';
import { revenue } from '../data';

/** Bars for revenue on the left axis, a line for margin (%) on a secondary right axis. */
export default function Basic() {
  return (
    <ComboChart
      data={revenue}
      xKey="month"
      series={[
        { key: 'revenue', label: 'Revenue, M ₸', type: 'bar' },
        { key: 'margin', label: 'Margin', type: 'line', axis: 'right', format: (v) => `${v}%` },
      ]}
      y2Axis={{ format: (v) => `${v}%` }}
      title="Revenue and margin"
    />
  );
}
