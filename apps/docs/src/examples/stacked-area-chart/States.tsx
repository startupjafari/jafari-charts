import { StackedAreaChart } from '@startupjafari/charts';
import { useState } from 'react';
import { activity } from '../data';

export default function States() {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <div className="demo-controls">
        <button type="button" className="btn btn-sm" onClick={() => setLoaded((l) => !l)}>
          {loaded ? 'Clear data' : 'Load data'}
        </button>
      </div>
      <StackedAreaChart
        data={loaded ? activity : []}
        xKey="date"
        series={[
          { key: 'students', label: 'Students' },
          { key: 'teachers', label: 'Teachers' },
        ]}
        emptyMessage="Nothing to show for the selected filters"
        height={220}
      />
    </>
  );
}
