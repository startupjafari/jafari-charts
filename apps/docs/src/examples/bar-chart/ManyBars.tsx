import { BarChart } from '@startupjafari/charts';
import { dailyUsers } from '../data';

/** 120 daily bars: date labels are inferred and thinned, every bar stays hoverable. */
export default function ManyBars() {
  return (
    <BarChart
      data={dailyUsers}
      xKey="date"
      yKey="sessions"
      label="Sessions"
      color="var(--jc-series-3)"
      height={240}
    />
  );
}
