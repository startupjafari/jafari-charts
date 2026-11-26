/** Props that turn a chart into a small, static, non-interactive preview (charts index). */
export const THUMB = {
  height: 120,
  xAxis: false,
  yAxis: false,
  legend: false,
  tooltip: false,
  crosshair: false,
  animation: false,
  accessibilityTable: false,
} as const;

/** The same for charts without axes (polar). */
export const THUMB_POLAR = {
  height: 120,
  legend: false,
  tooltip: false,
  animation: false,
  accessibilityTable: false,
} as const;
