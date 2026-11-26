import { DonutChart } from '@jafari/charts';

const budget = [
  { item: 'Salaries', amount: 61, color: '#6366F1' },
  { item: 'Research', amount: 18, color: '#14B8A6' },
  { item: 'Campus', amount: 12, color: '#F59E0B' },
  { item: 'Other', amount: 9, color: '#94A3B8' },
];

/** Colours from a data field, a thin ring, rounded ends and wider gaps. */
export default function Styling() {
  return (
    <DonutChart
      data={budget}
      labelKey="item"
      valueKey="amount"
      colorKey="color"
      thickness={0.16}
      cornerRadius={8}
      gap={4}
      legend={{ position: 'top', align: 'center' }}
      centerLabel="budget, %"
    />
  );
}
