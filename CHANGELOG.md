# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/). Until 1.0 a minor version may change
the public API; such changes are listed under "Changed" with a migration note.

## [Unreleased]

## [0.1.0] - 2026-11-27

First public release.

### Added

- `@jafari/charts`: umbrella package — every chart, primitive, theme and the core
  helpers from one import; `@jafari/charts/core`, `/themes`, `/export` and
  `/styles.css` subpaths. Per-family entries keep Next.js App Router bundles small
  with `optimizePackageImports: ['@jafari/charts']`.
- `@jafari/charts-core`: scales (linear, log, time, band, point, ordinal), nice
  ticks, curves, shapes, data processing, LTTB and min-max downsampling, k-d tree,
  treemap layout, number/date formatting in en/ru/kk (with a built-in Kazakh
  fallback for browsers whose ICU lacks `kk`), colour utilities, scene model,
  transitions and pure chart models for every chart type. No React, no DOM.
- `@jafari/charts-themes`: design tokens, validated light/dark palettes, CSS
  variables stylesheet, `createTheme`; `theme="auto"` follows the app's
  `color-scheme` and `.dark` / `[data-theme=dark]` ancestors.
- `@jafari/charts-react`: 20 chart types on one `ChartView` shell —
  - cartesian: Line, Area, Stacked Area, Bar, Horizontal Bar, Grouped Bar,
    Stacked Bar, Combo, Waterfall, Sparkline;
  - polar: Pie, Donut (centre readout), Radial Progress, Gauge (bands, needle);
  - Heatmap, Calendar Heatmap, Scatter (bubbles), Radar, Funnel, Treemap
    (drill-down).
- Interaction: tooltip, crosshair, legend toggle, keyboard navigation, touch;
  `syncId` (shared crosshair/tooltip across charts), `highlightedSeries`;
  zoom/pan/brush for time, category and scatter axes, calendar range selection,
  with controlled state (`xDomain`, `categoryRange`, `activeDate`,
  `drilldownPath`, …).
- Axes: wrapped category labels (`maxLines`, `maxLabelWidth`), collision-free
  ticks, `integer` value ticks, `yAxis.line`; per-bar colours with
  `SeriesConfig.colorBy`.
- Accessibility: `role="img"` with a generated description, hidden data table,
  live-region announcements, WCAG-checked contrast, reduced motion; messages in
  en/ru/kk, overridable via `messages` or `ChartProvider`.
- `@jafari/charts-canvas`: lazily loaded Canvas 2D renderer; `renderer="auto"`
  switches by measured thresholds (scatter: 75 000 points).
- `@jafari/charts-export`: SVG, PNG, WebP and CSV export (formula
  neutralisation, BOM for Excel), loaded on demand.
- `useChartCoordinates()` for custom primitives (data values → pixels).
- SSR and hydration support; React 18.2+ and 19.

[Unreleased]: https://github.com/startupjafari/jafari-charts/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/startupjafari/jafari-charts/releases/tag/v0.1.0
