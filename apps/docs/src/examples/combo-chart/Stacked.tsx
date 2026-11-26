import { ComboChart } from '@jafari/charts';
import { registrations } from '../data';

/** Bar series with the same `stackId` stack; the line stays on top. */
export default function Stacked() {
  return (
    <ComboChart
      data={registrations}
      xKey="month"
      series={[
        { key: 'teachers', label: 'Teachers', type: 'bar', stackId: 'staff' },
        { key: 'admins', label: 'Admins', type: 'bar', stackId: 'staff' },
        { key: 'students', label: 'Students', type: 'line', axis: 'right' },
      ]}
      height={260}
    />
  );
}
