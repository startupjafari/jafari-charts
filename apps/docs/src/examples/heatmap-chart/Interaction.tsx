import { HeatmapChart } from '@startupjafari/charts';
import { useState } from 'react';
import { sessionsByHour } from '../data';

/** Arrow keys move between cells (left/right = columns, up/down = rows). */
export default function Interaction() {
  const [cell, setCell] = useState('Click a cell');
  return (
    <>
      <HeatmapChart
        data={sessionsByHour}
        xKey="hour"
        yKey="day"
        valueKey="sessions"
        onClick={(e) => setCell(`${e.yLabel} ${e.xLabel}: ${e.value ?? 'no data'} sessions`)}
        height={260}
      />
      <output className="demo-output">{cell}</output>
    </>
  );
}
