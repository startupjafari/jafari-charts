# Jafari Charts — Architecture

> Engineered for performance. Beautiful charts. Zero compromise.

This document explains how the library is built and why. It is the reference for
contributors; the user-facing API lives in the README and the docs site.

## 1. Principles → mechanisms

| Principle                  | How it is enforced                                                                                                                                                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance first          | Pure, memoised layout; one pointer handler per chart throttled to the frame rate; hover state in an external store so only tooltip/crosshair re-render; batched SVG paths; LTTB/min-max downsampling; binary search and k-d tree hit testing; no background work when idle. |
| Beautiful by default       | Validated palette, 2px lines, 4px rounded data ends, surface gaps between stacked marks, hairline grid, value-first tooltips — all defaults, no configuration.                                                                                                              |
| Lightweight                | Zero runtime dependencies in the core; ESM with one output module per source module; `sideEffects: false`; canvas and export are lazy/optional. Budgets checked by `pnpm size`.                                                                                             |
| Zero chart dependencies    | Every scale, tick algorithm, curve, shape, layout and interaction is implemented here.                                                                                                                                                                                      |
| Framework-independent core | `@jafari/charts-core` has no React/DOM imports (enforced by ESLint `no-restricted-imports`). Chart _models_ (data → marks) live in the core.                                                                                                                                |
| Accessibility first        | Every chart has a role/name/description, a keyboard model, a live region and a hidden data table; identity never relies on colour alone.                                                                                                                                    |

## 2. Packages

```
@jafari/charts            umbrella: React components + selected core/themes exports
├── @jafari/charts-react  React adapter: ChartView shell, primitives, 20 chart components
│   ├── @jafari/charts-core    math core (no deps)
│   ├── @jafari/charts-themes  tokens, light/dark, CSS variables, stylesheet
│   └── @jafari/charts-canvas  Canvas 2D renderer (loaded lazily)
└── @jafari/charts-export  SVG/PNG/WebP/CSV export (separate entry: @jafari/charts/export)
```

There is deliberately **no `@jafari/charts-svg` package yet**: the SVG renderer is
the React layer (React owns the DOM), and everything renderer-independent —
path generation, mark batching, transitions — is already in the core. A separate
package would only make sense for a framework-free SVG string renderer
(server-side images, Vue/Svelte adapters); see ROADMAP "Later".

Workspace packages resolve each other's **TypeScript sources** in development
through the custom export condition `@jafari/source` (see `tsconfig.base.json`
`customConditions`, `vitest.config.ts`, playground `vite.config.ts`). No build is
needed to test or develop. Published manifests (`publishConfig.exports`) expose
only `dist`.

## 3. Data flow

```
data (T[]) ──► columns (Float64Array per field, NaN = gap, sorted by x)
           ──► chart model (core: pure function of data + size + options)
                 • frame: plot rect, scales, axis ticks (deterministic, no DOM)
                 • marks: rect | arc | line | area | symbol | polygon | rule
                 • labels: text marks
                 • queries: hitTest, point, bandRect …
           ──► adapter (react: tooltip rows, keyboard moves, active marks)
           ──► ChartView (react): layers + interaction + a11y
                 • SVG renderer: SeriesLayer (batched <path>s), or
                 • Canvas renderer: same marks via the same PathSink geometry
```

### Scene model

All data is drawn as **marks** (`core/src/scene/marks.ts`). Geometry generators
write to a `PathSink` interface implemented by both an SVG path-string builder
and the native `CanvasRenderingContext2D`, so SVG and Canvas share 100% of the
geometry code. Marks carry `series`/`index` for hit testing and accessibility and
an optional `enter` state used by transitions.

`batchMarks` merges consecutive same-style marks into one path: a 365-bar chart is
one `<path>` per series. Hit testing is mathematical (band inversion, binary
search, k-d tree, angle tests), so no per-mark DOM node is needed.

### Layout without the DOM

Axis margins, label thinning and truncation use `estimateTextWidth`, a
deterministic per-character width table. It never reads the DOM, so server and
client compute identical layouts (no hydration mismatch) and no forced reflow
happens during render. Errors are a few pixels and err on the wide side.

## 4. React layer

`ChartView` is the single shell used by every chart. It owns:

- **Layers**: background SVG (grid, cursor) → data layer (SVG or canvas) →
  labels/axes/children → active marks → overlay (crosshair, brush).
- **Interaction**: one `pointermove` handler on the surface, coalesced with
  `requestAnimationFrame` (`frameThrottle`); touch keeps the tooltip after the
  finger lifts; keyboard navigation (arrows, Home/End, Enter, Escape, +/−/0 for zoom).
- **State**: fast-changing state (`active`, `pointer`, `highlight`, `brush`) lives in
  a per-chart store (`core/interaction/store.ts`) read with
  `useSyncExternalStore` selectors. Moving the mouse re-renders only the tooltip
  content (when the active item changes), the crosshair and the active marks. The
  tooltip _position_ is applied directly to its style (no React render).
- **Controlled/uncontrolled** `activeIndex`, `hiddenSeries`, `xDomain`.
- **States**: empty, loading (keeps the previous render dimmed — no skeleton flash),
  error with retry.
- **A11y**: `role="figure"`, a focusable `role="img"` surface with a label and a
  description, a polite live region for keyboard navigation, a hidden data table.

Chart components are thin presets: e.g. `LineChart` = `CartesianChart` with
`type: 'line'`. All bar variants, areas, combo, waterfall and sparkline share the
cartesian engine; pie/donut/gauge/radial progress share the polar engine.

### Sizing and SSR

Width comes from one shared `ResizeObserver` (one observer for every chart on the
page), measured once synchronously before first paint. On the server the chart
renders at `initialWidth` (default 640) so HTML is meaningful; hydration renders the
same markup, then re-lays out at the measured width. IDs come from `useId`
(stable across server/client, unique per chart → unique gradient/clip ids).

### Animation

`useMarkTransition` plans one tween per data change (default 200 ms, cubic-out),
interpolating marks matched by key (enter from `enter` state, exit back to it).
Transitions are skipped for size changes, for scenes above 4 000 points, when the
user prefers reduced motion, and during hydration. A finished tween schedules no
further frames; pending frames are cancelled on unmount.

## 5. Theming

Tokens (`themes/src/tokens.ts`) are the single source of truth for both the CSS
stylesheet (`styles.css`, also injected at runtime) and JS theme objects.

`theme="auto"` follows **the host application**, not the OS:

1. a `.dark` / `[data-theme=dark]` ancestor (Tailwind, next-themes) → dark;
2. otherwise the app's `color-scheme` through CSS `light-dark()` (next-themes sets it);
3. an app that declares no dark support stays light even when the OS is dark.

`theme="light" | "dark"` forces a mode; `createTheme()` overrides tokens inline
(and per mode through a scoped style element). Canvas resolves colours through a
hidden probe element, so it uses exactly the colours CSS computes (including
`light-dark()` and `color-mix()`).

The categorical palette order was validated for colour-vision deficiency
(adjacent-pair OKLab ΔE ≥ 8 under protan/deutan simulation) in both modes; dark
mode uses darker steps of the same hues.

## 6. Decisions log

| Decision                                             | Reason                                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| TypeScript 5.9 (not 7.0)                             | typescript-eslint supports `< 6.1`; StudentHub uses 5.9.                                                                 |
| Node 24 for development (`.nvmrc`)                   | Vitest 5 and jsdom 31 require Node ≥ 22; StudentHub requires ≥ 24. Global nvm default untouched.                         |
| No Turborepo                                         | Six packages build in < 10 s with `pnpm -r` topological order; caching adds a dependency without measurable benefit yet. |
| Vite library mode + `tsc` declarations               | Transparent, no extra bundler; `preserveModules` keeps tree shaking precise.                                             |
| `"use client"` banner on React output                | Next.js App Router can import charts from server components.                                                             |
| Styles auto-injected (React 19 `<style precedence>`) | Zero-config; deduplicated and SSR-safe. `injectStyles={false}` + `styles.css` for strict CSP.                            |
| Category axis for bar charts over dates              | Bars need bands; dates are labelled with an inferred format and thinned.                                                 |
| `includeZero: 'auto'` for lines                      | Counts start at zero; prices/temperatures zoom to their range.                                                           |
| No dual axis by default                              | Secondary axis only when a series opts in (`axis: 'right'`, Combo chart).                                                |
| Tooltips enhance, never gate                         | Every value is also in the data table / keyboard announcements.                                                          |
