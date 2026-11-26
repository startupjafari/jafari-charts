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

### 2026-11-26 — Phases 1–4 complete; 5–6 in progress; 7 waiting for the owner

- All 20 chart types implemented on two shared engines (cartesian, polar) plus
  dedicated models (heatmap, calendar, scatter, radar, funnel, treemap); every
  model is pure, in the core, and unit-tested.
- Tests: 313 unit/component/SSR/hydration tests (Vitest), 41 Playwright tests
  (interaction, touch, zoom/brush, locales, responsive 320–1440 px, axe in both
  themes) and 116 visual baselines.
- Sizes (gzip, consumer build): base core 9.9 KB; React layer for LineChart
  13.7 KB; LineChart with all core it needs + CSS 33.0 KB; everything 65.5 KB.
- Benchmarks (`pnpm bench`, production build): see benchmarks/results/REPORT.md.
- Storybook (`pnpm storybook`), docs site (`pnpm dev:docs`), CI workflow.

#### StudentHub analysis (read-only, Phase 7 preparation)

- Recharts is used only in `apps/web/src/shared/ui/chart/` (bar, line/area,
  stacked bar) by ~7 dashboards; hand-rolled sparkline/meter elsewhere.
- Needs covered: row data (their props are column-oriented — a thin adapter),
  `syncId` (added for this), external series focus (`highlightedSeries`),
  `class="dark"` theming (next-themes) via `theme="auto"`, `kk`/`ru`/`en` locales
  (Kazakh ICU fallback added), charts loaded with `next/dynamic({ ssr: false })`.
- Their rules require owner approval: new dependencies are a stop point
  (`AGENTS.md`), `docs/FRONTEND_RULES.md` §1 mandates Recharts, and
  `docs/DESIGN_SYSTEM.md` §12/§17 must be updated with any chart change.
  Their commits must not carry AI attribution trailers.

Next: full benchmark run on an idle machine, React 18 compatibility check,
docs site review, then the owner's decisions for Phase 7 and npm publishing.
