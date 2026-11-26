import { GaugeChart } from '@jafari/charts';

export default function Responsive() {
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <GaugeChart value={68} label="Satisfaction" height={170} />
    </div>
  );
}
