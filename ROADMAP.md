# Jafari Charts — Roadmap

Status legend: ✅ done · 🔄 in progress · ⏳ planned

Each phase is "done" only when **all** of its criteria hold and `pnpm check`
(lint, typecheck, unit/component/SSR tests, build, bundle budgets, pack check)
passes.

## Phase 1 — Foundation ✅

- Monorepo (pnpm workspaces), strict TypeScript, ESLint, Prettier, Vitest projects.
- Math core: scales (linear, log, time, band, point, ordinal), nice ticks, time ticks,
  path builder, curves (linear, monotone, step ×3), shapes (lines with gaps, areas,
  rounded rects, annular sectors with corner radius and gaps, symbols), data
  (coercion, columns, stacking, shares, LTTB, min-max), algorithms (binary search,
  k-d tree, squarified treemap), interaction (store, frame throttle, zoom math),
  formatting (Intl numbers/dates, en/ru/kk messages, text measurement), colour.
- SVG renderer: scene marks, batching, gradients with unique ids, layers.
- Theme system: tokens → CSS variables, light/dark/auto, `createTheme`.
- Basic documentation: README, ARCHITECTURE, DEVELOPMENT, ROADMAP.

**Done criteria:** core has zero runtime dependencies and no React/DOM imports
(lint-enforced); every core module has unit tests including edge cases (empty,
equal, zero, negative, NaN, huge values); packages build to ESM + `.d.ts`; base
core ≤ 15 KB gzip.

## Phase 2 — Core charts ✅

Line, Area, Bar, Horizontal Bar, Grouped Bar, Stacked Bar (absolute/percent),
Donut, Pie, Sparkline, Radial Progress; tooltip, legend, crosshair, responsive
layout, touch, accessibility, tests.

**Done criteria:** all 10 charts render in light/dark without console errors or
horizontal overflow at 320–1440 px; keyboard and touch work; component tests
cover empty/one value/all zero/negative/missing/long labels/many series;
SSR + hydration without mismatches; React layer for a single chart ≤ 25 KB gzip.

## Phase 3 — Advanced charts ✅

Heatmap, Radar, Scatter, Funnel, Treemap, Gauge; item tooltips, nearest-point
search, extended interactions.

**Done criteria:** as Phase 2, plus scatter hit testing via k-d tree (≤ 1 ms per
pointer move at 100 k points) and heatmap cells drawn as ≤ 10 paths in SVG.

## Phase 4 — Professional charts ✅

Waterfall, Combo, Calendar Heatmap, Stacked Area; zoom, pan, reset, brush.

**Done criteria:** zoom/pan/brush via mouse, wheel (Ctrl/pinch), touch pinch and
keyboard; controlled `xDomain`; calendar heatmap localised (week start, month names).

## Phase 5 — Performance ✅

Canvas renderer integration and `renderer="auto"` thresholds from benchmarks;
downsampling defaults; benchmark suite (30 → 1 000 000 points; 1/10/20/50 charts;
streaming, resize, filter switching); memory/leak checks; bundle optimisation.

**Done criteria:** reproducible benchmark report committed (`benchmarks/results`);
no leaks after 100 mount/unmount cycles; no long tasks > 50 ms when hovering
charts up to 10 k points (SVG) / 1 M points (canvas, downsampled).

## Phase 6 — Developer experience ✅

Docs site (all pages, live examples, props tables), Playground (code generation,
SVG/Canvas toggle, performance panel), Storybook, export module, npm packaging.

**Done criteria:** docs built only with Jafari Charts; `pnpm pack` contents verified;
`@startupjafari/charts` installable from a tarball in a fresh Vite app and a Next.js app.

## Phase 7 — StudentHub integration 🟡 done on a branch, waiting for npm 0.1.0

StudentHub's charts (`shared/ui/chart`, dashboard sparklines, the career funnel) run
on Jafari Charts on the local branch `feat/jafari-charts`, with no changes to
business logic, API contracts or permissions; Recharts is removed. Measured with
StudentHub's own build: chart chunks 124.8 → 51.6 KB gzip, long tasks while hovering
107 ms → 0, hover p95 33.3 → 16.8 ms at 4× CPU slowdown. Report:
`docs/reports/jafari-charts-migration.md` in StudentHub.

Remaining: once `0.1.0` is on npm, replace the temporary tarball install with
`@startupjafari/charts@^0.1.0` (StudentHub's 7-day `minimumReleaseAge` needs either the wait
or an exception for `@startupjafari/*`) before the branch is merged.

## Later

- Framework-free SVG string renderer (`@startupjafari/charts-svg`) for server-side images.
- OffscreenCanvas/worker rendering — only if benchmarks show main-thread benefit.
- Vue/Svelte adapters on top of the core models.
