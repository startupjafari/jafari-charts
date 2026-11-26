import { ChartReferenceDot, LineChart } from '@jafari/charts';
import { dailyUsers } from '../data';

const record = dailyUsers.reduce((best, d) => (d.users > best.users ? d : best));

export default function ReferenceDot() {
  return (
    <LineChart data={dailyUsers} xKey="date" yKey="users" label="Users" height={240}>
      <ChartReferenceDot
        x={record.date}
        y={record.users}
        label={`Record: ${record.users}`}
        color="var(--jc-series-1)"
      />
    </LineChart>
  );
}
