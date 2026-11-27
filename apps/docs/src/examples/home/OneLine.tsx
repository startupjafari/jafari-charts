import { BarChart } from '@startupjafari/charts';
import { registrations } from '../data';

export default function OneLine() {
  return <BarChart data={registrations} xKey="month" yKey="students" height={220} />;
}
