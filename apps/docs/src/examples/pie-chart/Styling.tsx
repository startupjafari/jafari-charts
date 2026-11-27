import { PieChart } from '@startupjafari/charts';
import { roles } from '../data';

/** A half pie: angles in degrees, clockwise from 12 o'clock. */
export default function Styling() {
  return (
    <PieChart
      data={roles}
      labelKey="role"
      valueKey="count"
      colors={['#6366F1', '#22D3EE', '#F472B6', '#FACC15']}
      startAngle={-90}
      endAngle={90}
      gap={3}
      cornerRadius={6}
      sort
      labelFormatter={(_, share) => `${Math.round(share * 100)}%`}
      height={220}
    />
  );
}
