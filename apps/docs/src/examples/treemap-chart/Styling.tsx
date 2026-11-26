import { TreemapChart } from '@jafari/charts';
import { budgetTree } from '../data';

export default function Styling() {
  return (
    <TreemapChart
      data={budgetTree}
      colors={['#0EA5E9', '#F97316', '#22C55E', '#A855F7']}
      depthShading
      headers={false}
      gap={4}
      cornerRadius={8}
      legend={{ position: 'top' }}
      height={320}
    />
  );
}
