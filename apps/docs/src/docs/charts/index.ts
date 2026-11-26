import type { ChartDoc } from '../types';
import { areaChart } from './area-chart';
import { barChart } from './bar-chart';
import { calendarHeatmap } from './calendar-heatmap';
import { comboChart } from './combo-chart';
import { donutChart } from './donut-chart';
import { funnelChart } from './funnel-chart';
import { gaugeChart } from './gauge-chart';
import { groupedBarChart } from './grouped-bar-chart';
import { heatmapChart } from './heatmap-chart';
import { horizontalBarChart } from './horizontal-bar-chart';
import { lineChart } from './line-chart';
import { pieChart } from './pie-chart';
import { radarChart } from './radar-chart';
import { radialProgressChart } from './radial-progress-chart';
import { scatterChart } from './scatter-chart';
import { sparkline } from './sparkline';
import { stackedAreaChart } from './stacked-area-chart';
import { stackedBarChart } from './stacked-bar-chart';
import { treemapChart } from './treemap-chart';
import { waterfallChart } from './waterfall-chart';

/**
 * Chart pages, in navigation order (grouped by `group` in the sidebar).
 * To add a chart: put its examples in `src/examples/<slug>/`, describe the page
 * in a `ChartDoc` in this folder, and list it here.
 */
export const CHARTS: readonly ChartDoc[] = [
  lineChart,
  areaChart,
  barChart,
  horizontalBarChart,
  groupedBarChart,
  stackedBarChart,
  donutChart,
  pieChart,
  sparkline,
  radialProgressChart,
  heatmapChart,
  radarChart,
  scatterChart,
  funnelChart,
  treemapChart,
  gaugeChart,
  waterfallChart,
  comboChart,
  calendarHeatmap,
  stackedAreaChart,
];
