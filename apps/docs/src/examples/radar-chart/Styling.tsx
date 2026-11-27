import { RadarChart } from '@startupjafari/charts';
import { profiles } from '../data';

export default function Styling() {
  return (
    <div className="demo-grid">
      <RadarChart
        data={profiles}
        labelKey="metric"
        series={[
          { key: 'north', label: 'North', color: '#0EA5E9' },
          { key: 'south', label: 'South', color: '#F97316' },
        ]}
        shape="circle"
        fillOpacity={0.3}
        dots={false}
        levels={4}
        min={0}
        max={100}
        height={280}
      />
      <RadarChart
        data={profiles}
        labelKey="metric"
        series={[
          { key: 'north', label: 'North' },
          { key: 'south', label: 'South' },
          { key: 'east', label: 'East' },
        ]}
        differentiate
        fillOpacity={0}
        startAngle={30}
        ticks={false}
        tooltip={false}
        height={280}
      />
    </div>
  );
}
