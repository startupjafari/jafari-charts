import { HorizontalBarChart } from '@startupjafari/charts';
import { useState } from 'react';
import { universities } from '../data';

/** Hover reports the item; arrow keys move between bars when the chart is focused. */
export default function Interaction() {
  const [hovered, setHovered] = useState<string>('—');
  return (
    <>
      <HorizontalBarChart
        data={universities}
        xKey="name"
        yKey="score"
        label="Rating"
        onHover={(e) => setHovered(e ? `${e.datum.name}: ${e.datum.score}` : '—')}
      />
      <output className="demo-output">hovered: {hovered}</output>
    </>
  );
}
