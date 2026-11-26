import { FunnelChart, formatPercent } from '@jafari/charts';
import { useState } from 'react';
import { admissions } from '../data';

export default function Interaction() {
  const [info, setInfo] = useState('Click a stage');
  return (
    <>
      <FunnelChart
        data={admissions}
        labelKey="stage"
        valueKey="count"
        onClick={(e) =>
          setInfo(
            `${e.label}: ${e.value} — ${formatPercent(e.ofFirst)} of first, ${
              Number.isNaN(e.dropOff)
                ? 'first stage'
                : `${e.dropOff} lost (${formatPercent(e.dropOffRate)})`
            }`,
          )
        }
      />
      <output className="demo-output">{info}</output>
    </>
  );
}
