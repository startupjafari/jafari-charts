import { StackedBarChart } from '@startupjafari/charts';
import { balance } from '../data';

/** Positive parts stack upwards, negative parts downwards from zero. */
export default function MixedSign() {
  return (
    <StackedBarChart
      data={balance}
      xKey="department"
      series={[
        { key: 'income', label: 'Income' },
        { key: 'grants', label: 'Grants' },
        { key: 'expenses', label: 'Expenses', color: 'var(--jc-negative)' },
      ]}
      valueFormatter={(v) => `${v} M ₸`}
      height={260}
    />
  );
}
