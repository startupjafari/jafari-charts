/**
 * @startupjafari/charts — engineered for performance. Beautiful charts. Zero compromise.
 *
 * Everything needed to render charts in React. Framework-independent utilities
 * are available from `@startupjafari/charts/core`, themes from `@startupjafari/charts/themes`
 * and the (lazily loadable) export module from `@startupjafari/charts/export`.
 */
// Re-exported per chart family through local modules: bundlers that optimise
// barrel imports (Next.js `optimizePackageImports`) can then resolve each name to
// one family and leave the other chart types out of the client bundle.
export * from './react/primitives';
export * from './react/cartesian';
export * from './react/pie';
export * from './react/radial';
export * from './react/scatter';
export * from './react/radar';
export * from './react/heatmap';
export * from './react/funnel';
export * from './react/treemap';
export {
  createTheme,
  darkTheme,
  lightTheme,
  palette,
  seriesColor,
  cssVar,
  type Theme,
  type ThemeInput,
  type ThemeMode,
  type ThemeTokens,
} from '@startupjafari/charts-themes';
export {
  formatNumber,
  formatCompact,
  formatPercent,
  formatCurrency,
  formatDate,
  getMessages,
  MESSAGES,
  type ChartMessages,
  type CurveType,
  type SymbolShape,
  type AxisValue,
} from '@startupjafari/charts-core';
