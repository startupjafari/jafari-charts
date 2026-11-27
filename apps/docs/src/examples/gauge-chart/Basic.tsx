import { GaugeChart } from '@startupjafari/charts';

export default function Basic() {
  return (
    <GaugeChart
      value={68}
      label="Satisfaction"
      bands={[
        { to: 40, color: 'var(--jc-negative)', label: 'Low' },
        { to: 75, color: 'var(--jc-warning)', label: 'Medium' },
        { to: 100, color: 'var(--jc-positive)', label: 'High' },
      ]}
      title="Student satisfaction"
    />
  );
}
