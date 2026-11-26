import { HeatmapChart } from '@jafari/charts';
import { enrolmentChange } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <HeatmapChart
        data={enrolmentChange}
        xKey="term"
        yKey="faculty"
        valueKey="change"
        colorScale="diverging"
        height={240}
      />
    </div>
  );
}
