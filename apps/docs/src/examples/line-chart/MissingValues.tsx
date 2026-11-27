import { LineChart } from '@startupjafari/charts';
import { temperature } from '../data';

/** `null` readings become gaps; the axis zooms to the range and keeps zero visible. */
export default function MissingValues() {
  return (
    <LineChart
      data={temperature}
      xKey="date"
      series={[
        { key: 'almaty', label: 'Almaty' },
        { key: 'astana', label: 'Astana' },
      ]}
      valueFormatter={(v) => `${v.toFixed(1)} °C`}
      yAxis={{ format: (v) => `${v}°` }}
      height={240}
    />
  );
}
