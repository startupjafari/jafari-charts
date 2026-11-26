import { ChartReferenceArea, ChartReferenceLine, LineChart } from '@jafari/charts';
import { dailyUsers } from '../data';

export default function Composition() {
  return (
    <LineChart data={dailyUsers} xKey="date" yKey="users" label="Users" height={260}>
      <ChartReferenceArea x1="2025-02-10" x2="2025-02-24" label="Exams" />
      <ChartReferenceLine y={1800} label="Goal" />
    </LineChart>
  );
}
