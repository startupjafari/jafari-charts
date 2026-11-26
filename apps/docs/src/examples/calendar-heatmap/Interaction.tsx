import { CalendarHeatmap } from '@jafari/charts';
import { useState } from 'react';
import { dailyLogins } from '../data';

/** Left/right move by a week, up/down by a day; Enter clicks the focused day. */
export default function Interaction() {
  const [day, setDay] = useState('Click a day');
  return (
    <>
      <CalendarHeatmap
        data={dailyLogins}
        dateKey="date"
        valueKey="logins"
        onClick={(e) =>
          setDay(`${e.date.toDateString()}: ${e.value === null ? 'no data' : `${e.value} logins`}`)
        }
      />
      <output className="demo-output">{day}</output>
    </>
  );
}
