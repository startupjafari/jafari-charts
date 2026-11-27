import { ScatterChart } from '@startupjafari/charts';
import { cloud } from '../data';

const data = cloud(100_000);

/**
 * 100 000 points. Hover uses a k-d tree; with renderer="auto" the chart switches
 * to Canvas above 75 000 points (the measured crossover for scatter plots).
 */
export default function ManyPoints() {
  return (
    <ScatterChart
      data={data}
      xKey="x"
      yKey="y"
      renderer="auto"
      animation={false}
      pointSize={2}
      opacity={0.35}
      height={300}
    />
  );
}
