import { HorizontalBarChart } from '@startupjafari/charts';

const ratings: { name: string; score: number }[] = [];

/** Without rows the chart reserves its minimum height (160 px). */
export default function States() {
  return (
    <HorizontalBarChart
      data={ratings}
      xKey="name"
      yKey="score"
      emptyMessage="No universities match this filter"
    />
  );
}
