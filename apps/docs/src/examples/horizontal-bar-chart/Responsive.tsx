import { HorizontalBarChart } from '@jafari/charts';
import { universities } from '../data';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <HorizontalBarChart data={universities} xKey="name" yKey="score" label="Rating" />
    </div>
  );
}
