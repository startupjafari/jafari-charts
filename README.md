# Jafari Charts

**Engineered for performance. Beautiful charts. Zero compromise.**

A self-contained data visualisation library for React with its own math core,
SVG and Canvas renderers and a consistent visual language. No third-party chart
libraries — every scale, curve, layout and interaction is implemented here.

> Status: `0.1.0` (development). Not yet published to npm.

## Install

```bash
pnpm add @jafari/charts
# react and react-dom (>= 18.2) are peer dependencies
```

## Quick start

```tsx
import { AreaChart, LineChart } from '@jafari/charts';

<AreaChart data={users} xKey="date" yKey="count" height={260} />

<LineChart
  data={analytics}
  xKey="date"
  series={[
    { key: 'students', label: 'Студенты' },
    { key: 'teachers', label: 'Преподаватели' },
  ]}
  locale="ru"
  height={280}
/>
```

Charts fill their container's width, follow resizes, pick tick values that never
overlap, show a crosshair and a shared tooltip, a legend for two or more series,
and a hidden data table for screen readers — with no configuration.

Keys are type-checked: `xKey` must be a date/number/string field and series keys
must be numeric fields of your data type.

## Charts

| Core                                                                                                                                                                    | Advanced                                                                                       | Professional                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `LineChart` · `AreaChart` · `BarChart` · `HorizontalBarChart` · `GroupedBarChart` · `StackedBarChart` · `DonutChart` · `PieChart` · `Sparkline` · `RadialProgressChart` | `HeatmapChart` · `RadarChart` · `ScatterChart` · `FunnelChart` · `TreemapChart` · `GaugeChart` | `WaterfallChart` · `ComboChart` · `CalendarHeatmap` · `StackedAreaChart` |

All 20 chart types are implemented. See [ROADMAP.md](ROADMAP.md) for project status.

## Common props

| Prop                                                        | Description                                                                       |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `height` / `width`                                          | Surface height (default 280). Width follows the container unless fixed.           |
| `theme`                                                     | `'auto'` (default, follows the app), `'light'`, `'dark'` or `createTheme({...})`. |
| `locale`                                                    | `'en'`, `'ru'`, `'kk'` or any BCP 47 tag (Intl number/date formatting).           |
| `animation`                                                 | `false` to disable, or `{ duration, easing, initial }`. Respects reduced motion.  |
| `renderer`                                                  | `'svg'` (default), `'canvas'`, `'auto'`.                                          |
| `tooltip`, `legend`, `crosshair`, `grid`, `xAxis`, `yAxis`  | `false` to hide or an options object.                                             |
| `valueFormatter`, `xFormatter`                              | Custom formatting.                                                                |
| `hiddenSeries` / `onHiddenSeriesChange`                     | Controlled legend toggling.                                                       |
| `activeIndex` / `onActiveIndexChange`, `onHover`, `onClick` | Controlled interaction and events.                                                |
| `zoom`, `brush`, `xDomain`                                  | Zoom/pan and range selection on continuous x axes.                                |
| `syncId`                                                    | Charts with the same id share crosshair and tooltip.                              |
| `highlightedSeries`                                         | Controlled emphasis of one series.                                                |
| `loading`, `error`, `onRetry`, `emptyMessage`               | Data states without layout jumps.                                                 |
| `title`, `description`                                      | Accessible name and description.                                                  |

Composable primitives (`ChartReferenceLine`, `ChartReferenceArea`,
`ChartReferenceDot`, `ChartAnnotation`, …) can be placed inside any cartesian chart:

```tsx
<LineChart data={data} xKey="date" yKey="value">
  <ChartReferenceLine y={100} label="Target" />
</LineChart>
```

## Theming

All visual parameters are CSS custom properties (`--jc-*`):

```css
.jc-root {
  --jc-series-1: #0ea5e9;
  --jc-radius: 6px;
}
```

or in JS:

```tsx
import { ChartProvider, createTheme } from '@jafari/charts';

const brand = createTheme({ series: ['#0EA5E9', '#22C55E'], dark: { grid: '#1f2937' } });

<ChartProvider theme={brand} locale="ru">
  …
</ChartProvider>;
```

Styles are injected automatically. For a strict CSP, import
`@jafari/charts/styles.css` and set `<ChartProvider injectStyles={false}>`.

## Export

The export module is a separate entry and is never part of your main bundle unless imported:

```ts
const { exportChart } = await import('@jafari/charts/export');
await exportChart(element, { format: 'png', scale: 2, background: 'light', filename: 'growth' });
```

## Accessibility

- Focusable chart surface with name and description; arrow keys move between data
  points, values are announced in a polite live region; Enter triggers `onClick`.
- Visually hidden data table (automatic up to 60 rows, configurable).
- Legend items are buttons with `aria-pressed`.
- `differentiate` adds marker shapes and dash patterns so series never rely on colour alone.
- Reduced motion and forced-colours modes are respected.

## Next.js

Charts work in the App Router, including imports from Server Components (component
modules carry `"use client"`; pages prerender with the chart SVG). Add the package
to `optimizePackageImports` so only the chart families you import are shipped —
Next.js does the same for other barrel packages such as Recharts:

```js
// next.config.mjs
export default { experimental: { optimizePackageImports: ['@jafari/charts'] } };
```

Measured with Next.js 15 (`LineChart` + `DonutChart` imported in a Server
Component): 41 KB of route JS with the option, 74 KB without it. Each chart
family is also available as a subpath (`@jafari/charts-react/cartesian`, `/pie`,
`/radial`, `/scatter`, `/radar`, `/heatmap`, `/funnel`, `/treemap`, `/primitives`).

## Server rendering

With React 19, the stylesheet is emitted during server rendering (hoisted
`<style precedence>`). React 18 has no style hoisting, so styles are injected on
the client — server-rendered React 18 apps should import
`@jafari/charts/styles.css` to avoid unstyled HTML before hydration.

Charts render on the server at `initialWidth` (default 640 px) and hydrate
without mismatches, then adapt to the real width. React components ship with the
`"use client"` directive for the Next.js App Router.

## Bundle size

Measured with `pnpm size` (consumer build, minified + gzip, React external):

| Import                                                   | gzip    |
| -------------------------------------------------------- | ------- |
| Base core (scales, geometry, curves, data, formatting)   | 8.7 KB  |
| React layer for `LineChart`                              | 13.2 KB |
| `LineChart` total (React layer + all math it uses + CSS) | 30.9 KB |
| Canvas renderer (lazy chunk)                             | 1.6 KB  |
| Export module                                            | 2.5 KB  |

## Packages

| Package                 | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `@jafari/charts`        | Main package (React components + utilities)        |
| `@jafari/charts-core`   | Framework-independent math core, zero dependencies |
| `@jafari/charts-react`  | React adapter                                      |
| `@jafari/charts-canvas` | Canvas 2D renderer                                 |
| `@jafari/charts-themes` | Tokens, themes, CSS                                |
| `@jafari/charts-export` | SVG/PNG/WebP/CSV export                            |

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) and [ARCHITECTURE.md](ARCHITECTURE.md).

## License

MIT (proposed; final decision by the project owner). © Mehman Jafari.
