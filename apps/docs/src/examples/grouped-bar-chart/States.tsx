import { GroupedBarChart } from '@jafari/charts';
import { useState } from 'react';
import { complaints } from '../data';

export default function States() {
  const [failed, setFailed] = useState(true);
  return (
    <GroupedBarChart
      data={failed ? [] : complaints}
      xKey="category"
      series={[
        { key: 'open', label: 'Open' },
        { key: 'resolved', label: 'Resolved' },
      ]}
      error={failed ? 'The complaints service did not respond.' : false}
      onRetry={() => setFailed(false)}
      height={220}
    />
  );
}
