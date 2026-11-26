import { BarChart, ChartReferenceLine } from '@jafari/charts';
import { useState } from 'react';
import { registrations } from '../data';

/** Click a bar (or focus the chart and press Enter) to select a month. */
export default function Selection() {
  const [selected, setSelected] = useState<(typeof registrations)[number] | null>(null);
  return (
    <>
      <BarChart
        data={registrations}
        xKey="month"
        yKey="students"
        label="Students"
        onClick={(e) => setSelected(e.datum)}
        height={240}
      >
        {selected ? <ChartReferenceLine x={selected.month} label="Selected" /> : null}
      </BarChart>
      <output className="demo-output">
        {selected
          ? `${selected.month}: ${selected.students} students, ${selected.teachers} teachers, ${selected.admins} admins`
          : 'No month selected'}
      </output>
    </>
  );
}
