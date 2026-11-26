import { BarChart, createTheme } from '@jafari/charts';
import { registrations } from '../data';

/** Tokens can be overridden per chart: palette, radius, grid colour per mode. */
const brand = createTheme({
  series: ['#F97316', '#0EA5E9'],
  light: { grid: '#fde7d4' },
  dark: { grid: '#3a2414' },
});

export default function Theme() {
  return (
    <BarChart
      theme={brand}
      data={registrations}
      xKey="month"
      series={[
        { key: 'students', label: 'Students' },
        { key: 'teachers', label: 'Teachers' },
      ]}
      stacked
      height={240}
    />
  );
}
