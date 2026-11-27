import { createTheme, LineChart } from '@startupjafari/charts';
import { activity } from '../data';

/** Tokens for every mode, plus per-mode overrides. */
const brand = createTheme({
  series: ['#0EA5E9', '#22C55E', '#F97316'],
  fontSizeSmall: '12px',
  tooltipRadius: '4px',
  light: { grid: '#e0f2fe', textSecondary: '#0369a1' },
  dark: { grid: '#0c2a3d', textSecondary: '#7dd3fc' },
});

export default function Brand() {
  return (
    <LineChart
      theme={brand}
      data={activity}
      xKey="date"
      series={[
        { key: 'students', label: 'Students' },
        { key: 'teachers', label: 'Teachers' },
        { key: 'staff', label: 'Staff' },
      ]}
      height={240}
    />
  );
}
