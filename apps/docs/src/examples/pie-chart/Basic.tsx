import { PieChart } from '@startupjafari/charts';
import { devices } from '../data';

export default function Basic() {
  return <PieChart data={devices} labelKey="device" valueKey="share" title="Sessions by device" />;
}
