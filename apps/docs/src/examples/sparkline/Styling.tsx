import { Sparkline } from '@startupjafari/charts';
import { temperature } from '../data';

export default function Styling() {
  return (
    <div className="demo-grid">
      <div>
        <p className="demo-caption">Positive colour, step curve</p>
        <Sparkline
          data={temperature}
          xKey="date"
          yKey="almaty"
          color="var(--jc-positive)"
          curve="step"
          height={48}
        />
      </div>
      <div>
        <p className="demo-caption">Negative colour, markers</p>
        <Sparkline
          data={temperature.slice(0, 20)}
          xKey="date"
          yKey="astana"
          color="var(--jc-negative)"
          dots
          height={48}
        />
      </div>
      <div>
        <p className="demo-caption">Area with zero baseline</p>
        <Sparkline
          data={temperature}
          xKey="date"
          yKey="astana"
          variant="area"
          color="#8B5CF6"
          height={48}
        />
      </div>
    </div>
  );
}
