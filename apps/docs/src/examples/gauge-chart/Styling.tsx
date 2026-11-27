import { GaugeChart } from '@startupjafari/charts';

export default function Styling() {
  return (
    <div className="demo-grid">
      <GaugeChart
        value={540}
        min={0}
        max={800}
        label="kWh today"
        color="#8B5CF6"
        thickness={10}
        height={170}
      />
      <GaugeChart
        value={0.64}
        max={1}
        variant="full"
        label="Occupancy"
        color="#0EA5E9"
        valueFormatter={(v) => `${Math.round(v * 100)}%`}
        height={170}
      />
    </div>
  );
}
