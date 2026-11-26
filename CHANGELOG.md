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
- `useChartCoordinates()` hook (data values → pixels for primitives).
- Verified React 18.3 compatibility (full test suite).
- `@jafari/charts`: umbrella package; Storybook workbench; benchmark suite;
  Playwright e2e/visual/a11y tests; CI workflow; pack check.
- `ScatterChart`: 2D zoom and pan (`zoom`, controlled `xDomain`/`onXDomainChange` and
  `yDomain`/`onYDomainChange`; log axes zoom in decades) and rectangle `brush` with
  `onBrush({ x, y, indices })`. Points outside the view are neither drawn nor hit-tested.
- Categorical zoom for bar, grouped/stacked bar, combo, waterfall and category-axis
  line/area charts: `zoom` shows a window of whole categories (Ctrl/⌘ + wheel, pinch,
  drag, `+` `-` `0`, Shift + arrows), `brush` selects a category range (same `onBrush`
  payload), controlled `categoryRange`/`onCategoryRangeChange`. Core: `x.range` cartesian
  option, `CartesianModel.indexAt`, `BandScale.offset`.
- `CalendarHeatmap`: controlled `activeDate`/`onActiveDateChange` and range selection
  (`brush`, `onBrush({ from, to })`) by dragging or with Shift + arrows.
- `TreemapChart`: controlled drill-down `drilldownPath`/`onDrilldownPathChange`.
- Zoom, pan and selection announce the visible/selected range in the live region
  (`visibleRange`, `selectedRange` messages); Shift + arrows pan a zoomed view.

### Changed

- Funnel, treemap and heatmap strings moved into the shared `ChartMessages` (en/ru/kk):
  they can be overridden with `messages` (per chart or in `ChartProvider`); the `texts`
  props keep working as per-chart overrides.
- Zoom/pan/brush gestures are one shared implementation (`useZoomGestures`) used by
  cartesian and scatter charts.

- Cross-browser test runs (Chromium, Firefox, WebKit, mobile Chrome/Safari) and
  visual baselines in the official Playwright Docker image (`pnpm test:e2e:all`).
- Export tests in real browsers (SVG standalone output, PNG scale/transparency,
  WebP, CSV quoting/formula neutralisation, downloads).
- Russian version of the documentation site (EN/RU switch, `#/ru/...` URLs).
- Localised chart-type names in accessible descriptions (ru, kk).

### Fixed

- Edge axis labels no longer overlap their neighbour after being shifted inwards.

- Hover on large SVG scenes repainted every data mark (scatter 10k points: 48 ms
  per frame); static and interactive layers are now separate (16.6 ms).
- Next.js App Router shipped every chart type (69.5 KB): per-family entries +
  `optimizePackageImports` → 41 KB.
- Integer epoch-millisecond x values are read as time; log-scale bars render;
  explicit `legend` shows for a single series; empty `RadialProgressChart` data
  shows the empty state.

- Tiny donut slices no longer draw an inverted inner arc (disc) when the gap is
  wider than the slice at the inner radius.
- Visually hidden data tables no longer widen the page on mobile.
- Legend buttons expose their visible text as the accessible name (WCAG 2.5.3).
- Canvas rendering of thousands of marks (Chromium `closePath()` slowdown).
