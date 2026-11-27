import { PieChart } from '@startupjafari/charts';
import { useState } from 'react';
import { roles } from '../data';

export default function Interaction() {
  const [hidden, setHidden] = useState<string[]>([]);
  const [clicked, setClicked] = useState('—');
  return (
    <>
      <PieChart
        data={roles}
        labelKey="role"
        valueKey="count"
        hiddenSeries={hidden}
        onHiddenSeriesChange={setHidden}
        onClick={(e) => setClicked(`${e.label}: ${e.value} (${Math.round(e.share * 100)}%)`)}
      />
      <output className="demo-output">
        hidden=[{hidden.join(', ')}] · clicked={clicked}
      </output>
    </>
  );
}
