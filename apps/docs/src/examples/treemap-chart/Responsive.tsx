import { TreemapChart } from '@startupjafari/charts';
import { budgetTree } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <TreemapChart data={budgetTree} height={300} />
    </div>
  );
}
