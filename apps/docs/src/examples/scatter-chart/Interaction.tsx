import { ScatterChart } from '@startupjafari/charts';
import { useState } from 'react';
import { cohort } from '../data';

/** Hover and click report the datum; the legend toggles faculties; arrows walk the points. */
export default function Interaction() {
  const [hidden, setHidden] = useState<string[]>([]);
  const [picked, setPicked] = useState('Click a point');
  return (
    <>
      <ScatterChart
        data={cohort}
        xKey="hours"
        yKey="grade"
        groupKey="faculty"
        labelKey="name"
        hiddenSeries={hidden}
        onHiddenSeriesChange={setHidden}
        onClick={(e) => setPicked(`${e.datum.name} (${e.series}): ${e.x} h, grade ${e.y}`)}
        height={280}
      />
      <output className="demo-output">
        {picked} · hidden=[{hidden.join(', ')}]
      </output>
    </>
  );
}
