import { BarChart, LineChart } from '@jafari/charts';
import { registrations } from '../data';

/** Lines get a crosshair (here with a horizontal line too); bars get a soft cursor band. */
export default function Crosshair() {
  return (
    <div className="demo-grid">
      <LineChart
        data={registrations}
        xKey="month"
        yKey="students"
        label="Students"
        crosshair={{ horizontal: true }}
        height={200}
      />
      <BarChart data={registrations} xKey="month" yKey="students" label="Students" height={200} />
    </div>
  );
}
