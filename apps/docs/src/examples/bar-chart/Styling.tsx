import { BarChart } from '@jafari/charts';
import { registrations } from '../data';

export default function Styling() {
  return (
    <BarChart
      data={registrations}
      xKey="month"
      yKey="teachers"
      label="Teachers"
      color="#14B8A6"
      barRadius={10}
      maxBarSize={40}
      categoryGap={0.15}
      grid={false}
      yAxis={{ hidden: true }}
      labels
      height={240}
    />
  );
}
