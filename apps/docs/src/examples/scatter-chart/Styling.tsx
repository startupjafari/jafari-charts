import { ChartReferenceLine, ScatterChart } from '@jafari/charts';
import { cohort } from '../data';

/** Shapes per group, custom colours, smaller translucent markers and axis titles. */
export default function Styling() {
  return (
    <ScatterChart
      data={cohort}
      xKey="hours"
      yKey="grade"
      groupKey="faculty"
      differentiate
      colors={['#0EA5E9', '#F43F5E', '#A855F7']}
      pointSize={7}
      opacity={0.75}
      xAxis={{ title: 'hours / week', line: true }}
      yAxis={{ title: 'grade', min: 40, max: 100 }}
      grid={{ horizontal: true, vertical: true }}
      legend={{ position: 'top', align: 'end' }}
      height={300}
    >
      <ChartReferenceLine y={70} label="Pass" />
    </ScatterChart>
  );
}
