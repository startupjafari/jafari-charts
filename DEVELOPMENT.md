# Jafari Charts — Development

## Requirements

- Node.js 24 (`.nvmrc`; Node ≥ 22.12 works). With nvm: `nvm use` in the repo.
- pnpm 12 (`packageManager` field).
- Playwright Chromium for e2e/visual tests: `pnpm exec playwright install chromium`
  (the pinned Playwright 1.64.1 matches the browser already used by StudentHub).

## Commands

| Task                               | Command                                       |
| ---------------------------------- | --------------------------------------------- |
| Install                            | `pnpm install`                                |
| Playground (dev sandbox, fixtures) | `pnpm dev:playground` → http://localhost:5174 |
| Docs site                          | `pnpm dev:docs`                               |
| Unit + component + SSR tests       | `pnpm test` (`pnpm test:watch`)               |
| Coverage                           | `pnpm test:coverage`                          |
| E2E / visual / a11y                | `pnpm test:e2e`                               |
| Type check                         | `pnpm typecheck`                              |
| Lint / format                      | `pnpm lint`, `pnpm format`                    |
| Build packages                     | `pnpm build`                                  |
| Bundle budgets                     | `pnpm size` (after `pnpm build`)              |
| Package contents                   | `pnpm pack:check`                             |
| Benchmarks                         | `pnpm bench`                                  |
| Everything CI runs                 | `pnpm check`                                  |

Tests and dev servers resolve workspace packages to their TypeScript sources
(`@jafari/source` export condition), so no build is needed while developing.
`pnpm size` and `pnpm pack:check` measure the built `dist` output.

## Layout

```
packages/core     math core (scales, geometry, layout, data, chart models)
packages/themes   tokens, CSS stylesheet, createTheme
packages/canvas   Canvas 2D renderer
packages/react    React components (ChartView shell, primitives, charts)
packages/export   SVG/PNG/WebP/CSV export
packages/charts   @jafari/charts umbrella
apps/playground   dev sandbox + deterministic fixtures for e2e/visual/bench
apps/docs         documentation site
benchmarks        size and performance scripts, committed results
tests/e2e         Playwright tests
scripts           build helpers (vite-lib, size, pack-check, screenshots)
```

## Conventions

- Strict TypeScript; no `any` (lint error); `noUncheckedIndexedAccess` on.
- The core must not import React or touch the DOM (lint-enforced).
- New math goes into the core with unit tests; React components stay thin.
- Every chart is a preset over a shared engine — never duplicate layout logic.
- Colours in marks are CSS colours or `var(--jc-*)` tokens; text uses text tokens.
- Prefer measured optimisations: add a benchmark or size scenario with the change.
- Commit messages: conventional style (`feat(core): …`, `fix(react): …`).

## Progress log

### 2026-11-26 — Phase 1 complete, Phase 2 in progress

- Monorepo, tooling, docs; core math with 146 unit tests.
- Themes with validated palette; `auto` follows the host app (`light-dark()` + classes).
- React layer: ChartView shell (layers, interaction, states, a11y), primitives
  (axes, grid, tooltip, legend, crosshair, cursor, reference line/area/dot, label,
  gradient, marker, annotation, empty/loading/error states).
- Cartesian charts: Line, Area, Stacked Area, Bar, Horizontal Bar, Grouped Bar,
  Stacked Bar (absolute/percent), Combo (secondary axis), Waterfall, Sparkline.
- Zoom/pan/brush engine for continuous x axes.
- Canvas renderer (lazy) and export module (SVG/PNG/WebP/CSV).
- Sizes (gzip): base core 8.7 KB; React layer for LineChart 13.2 KB; LineChart
  with all core it needs + CSS 30.9 KB.

Next: Donut, Pie, Radial Progress (polar engine), then Phase 3.
