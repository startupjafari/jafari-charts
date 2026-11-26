import { GaugeChart } from '@jafari/charts';

/** A needle over the band scale, on a 270° arc. */
export default function Needle() {
  return (
    <GaugeChart
      value={82}
      needle
      variant="arc"
      label="Server load"
      valueFormatter={(v) => `${v}%`}
      bands={[
        { to: 60, color: 'var(--jc-positive)' },
        { to: 85, color: 'var(--jc-warning)' },
        { to: 100, color: 'var(--jc-negative)' },
      ]}
      height={220}
    />
  );
}
