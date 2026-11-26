import { WaterfallChart } from '@jafari/charts';
import { useState } from 'react';
import { cashflow } from '../data';

export default function Interaction() {
  const [step, setStep] = useState('Click a bar');
  return (
    <>
      <WaterfallChart
        data={cashflow}
        xKey="step"
        yKey="value"
        isTotal={(d) => Boolean(d.total)}
        onClick={(e) =>
          setStep(`${e.datum.step}: ${e.datum.total ? 'running total' : e.datum.value}`)
        }
        height={240}
      />
      <output className="demo-output">{step}</output>
    </>
  );
}
