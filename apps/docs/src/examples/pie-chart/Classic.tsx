import { PieChart } from '@jafari/charts';
import { roles } from '../data';

/** No gaps, no labels, legend on top. */
export default function Classic() {
  return (
    <PieChart
      data={roles}
      labelKey="role"
      valueKey="count"
      gap={0}
      cornerRadius={0}
      labels={false}
      legend={{ position: 'top', align: 'center' }}
      height={220}
    />
  );
}
