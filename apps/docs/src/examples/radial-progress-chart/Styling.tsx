import { RadialProgressChart } from '@jafari/charts';

export default function Styling() {
  return (
    <div className="demo-grid">
      <RadialProgressChart
        variant="arc"
        value={38}
        max={50}
        label="Credits"
        color="#14B8A6"
        thickness={14}
        valueFormatter={(v, max) => `${v}/${max}`}
        height={180}
      />
      <RadialProgressChart
        data={[
          { label: 'Fall', value: 92, color: '#6366F1' },
          { label: 'Spring', value: 74, color: '#F472B6' },
        ]}
        thickness={8}
        gap={6}
        centerValue="83%"
        centerLabel="average"
        height={180}
      />
    </div>
  );
}
