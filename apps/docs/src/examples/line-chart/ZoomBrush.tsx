import { formatDate, LineChart } from '@startupjafari/charts';
import { useState } from 'react';
import { serverLoad } from '../data';

const data = serverLoad(2000);

export default function ZoomBrush() {
  const [domain, setDomain] = useState<readonly [number, number] | null>(null);
  const fmt = (t: number) => formatDate(t, { month: 'short', day: 'numeric', hour: 'numeric' });
  return (
    <>
      <LineChart
        data={data}
        xKey="time"
        xAxis={{ type: 'time' }} // numeric timestamps: declare the axis as time
        yKey="load"
        label="Server load"
        valueFormatter={(v) => `${v}%`}
        zoom
        brush
        xDomain={domain}
        onXDomainChange={setDomain}
        animation={false}
        height={260}
      />
      <output className="demo-output">
        {domain ? `Visible: ${fmt(domain[0])} – ${fmt(domain[1])}` : 'Showing all 2 000 points'}
      </output>
    </>
  );
}
