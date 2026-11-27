import { LineChart } from '@startupjafari/charts';
import { activity } from '../data';

export default function Series() {
  return (
    <LineChart
      data={activity}
      xKey="date"
      series={[
        { key: 'students', label: 'Студенты' },
        { key: 'teachers', label: 'Преподаватели' },
      ]}
      locale="ru"
      height={280}
    />
  );
}
