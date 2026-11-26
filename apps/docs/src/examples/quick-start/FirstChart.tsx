import { AreaChart } from '@jafari/charts';

const users = [
  { date: '2025-01-01', count: 120 },
  { date: '2025-02-01', count: 180 },
  { date: '2025-03-01', count: 260 },
  { date: '2025-04-01', count: 240 },
  { date: '2025-05-01', count: 330 },
  { date: '2025-06-01', count: 410 },
];

export default function FirstChart() {
  return <AreaChart data={users} xKey="date" yKey="count" height={260} />;
}
