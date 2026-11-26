import { LineChart } from '@jafari/charts';
import { revenue } from '../data';

const money = (v: number) => `${v} M ₸`;

export default function Styling() {
  return (
    <LineChart
      data={revenue}
      xKey="month"
      series={[
        { key: 'revenue', label: 'Revenue', color: '#0EA5E9' },
        { key: 'costs', label: 'Costs', color: '#F43F5E', dashed: true },
      ]}
      curve="linear"
      dots
      grid={{ horizontal: true, vertical: true }}
      xAxis={{ line: true }}
      yAxis={{ title: 'million ₸', format: (v) => `${v}`, includeZero: false }}
      valueFormatter={money}
      legend={{ position: 'top', align: 'end' }}
      height={260}
    />
  );
}
