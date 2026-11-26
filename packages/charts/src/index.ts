/**
 * @jafari/charts — engineered for performance. Beautiful charts. Zero compromise.
 *
 * Everything needed to render charts in React. Framework-independent utilities
 * are available from `@jafari/charts/core`, themes from `@jafari/charts/themes`
 * and the (lazily loadable) export module from `@jafari/charts/export`.
 */
export * from '@jafari/charts-react';
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
} from '@jafari/charts-themes';
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
} from '@jafari/charts-core';
