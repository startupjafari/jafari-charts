import { ChartProvider, createTheme, LineChart, Sparkline } from '@startupjafari/charts';
import { activity } from '../data';

const brand = createTheme({
  series: ['#0EA5E9', '#F97316', '#A855F7'],
  radius: '6px',
  dark: { grid: '#1e293b' },
});

/** App-wide defaults. Props on a chart override the provider. */
export default function Provider() {
  return (
    <ChartProvider theme={brand} locale="en-GB" animation={{ duration: 320, easing: 'expoOut' }}>
      <LineChart
        data={activity}
        xKey="date"
        series={[
          { key: 'students', label: 'Students' },
          { key: 'teachers', label: 'Teachers' },
          { key: 'staff', label: 'Staff' },
        ]}
        height={220}
      />
      <div style={{ maxWidth: 240, marginTop: 12 }}>
        <Sparkline
          data={activity}
          xKey="date"
          yKey="teachers"
          color="var(--jc-series-2)"
          title="Teachers"
        />
      </div>
    </ChartProvider>
  );
}
