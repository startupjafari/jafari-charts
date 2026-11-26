# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `@jafari/charts-core`: scales, ticks, curves, shapes, data processing,
  downsampling, k-d tree, treemap, formatting (en/ru/kk), colour, scene model,
  transitions, cartesian and waterfall chart models.
- `@jafari/charts-themes`: design tokens, validated light/dark palettes, CSS
  variables stylesheet, `createTheme`.
- `@jafari/charts-react`: ChartView shell, primitives and cartesian charts (Line,
  Area, Stacked Area, Bar, Horizontal Bar, Grouped Bar, Stacked Bar, Combo,
  Waterfall, Sparkline) with tooltip, legend, crosshair, zoom/pan/brush,
  keyboard navigation and accessibility.
- `@jafari/charts-canvas`: lazily loaded Canvas 2D renderer.
- `@jafari/charts-export`: SVG, PNG, WebP and CSV export.
- Polar charts: Pie, Donut (centre readout), Radial Progress, Gauge (bands, needle).
- Advanced charts: Heatmap, Calendar Heatmap, Scatter (bubbles, k-d tree hover),
  Radar, Funnel, Treemap (drill-down).
- `syncId` (shared crosshair/tooltip), `highlightedSeries`, zoom/pan/brush.
- Kazakh number/date formatting fallback for browsers whose ICU lacks `kk`.
- `@jafari/charts`: umbrella package; Storybook workbench; benchmark suite;
  Playwright e2e/visual/a11y tests; CI workflow; pack check.

### Fixed

- Tiny donut slices no longer draw an inverted inner arc (disc) when the gap is
  wider than the slice at the inner radius.
- Visually hidden data tables no longer widen the page on mobile.
- Legend buttons expose their visible text as the accessible name (WCAG 2.5.3).
- Canvas rendering of thousands of marks (Chromium `closePath()` slowdown).
