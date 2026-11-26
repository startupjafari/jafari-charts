import { GaugeChart } from '@jafari/charts';

/** A non-finite value (NaN) means "no data" and shows the empty state. */
export default function States() {
  return (
    <GaugeChart
      value={Number.NaN}
      label="Satisfaction"
      emptyMessage="No survey responses yet"
      height={180}
    />
  );
}
