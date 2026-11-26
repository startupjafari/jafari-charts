import { Sparkline } from '@jafari/charts';
import { dailyUsers } from '../data';

const last30 = dailyUsers.slice(-30);

export default function Variants() {
  return (
    <div className="demo-grid">
      <div>
        <p className="demo-caption">line</p>
        <Sparkline data={last30} xKey="date" yKey="users" title="Users, last 30 days" />
      </div>
      <div>
        <p className="demo-caption">area</p>
        <Sparkline
          data={last30}
          xKey="date"
          yKey="sessions"
          variant="area"
          color="var(--jc-series-2)"
          title="Sessions, last 30 days"
        />
      </div>
      <div>
        <p className="demo-caption">bar</p>
        <Sparkline
          data={last30.slice(-14)}
          xKey="date"
          yKey="users"
          variant="bar"
          color="var(--jc-series-3)"
          title="Users, last 14 days"
        />
      </div>
    </div>
  );
}
