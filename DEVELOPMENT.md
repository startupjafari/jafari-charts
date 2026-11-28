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
| Docs site E2E / a11y               | `pnpm test:e2e:docs`                          |
| Docs site visual baselines         | `pnpm test:visual:docs` (`…:update`, Docker)  |
| Type check                         | `pnpm typecheck`                              |
| Lint / format                      | `pnpm lint`, `pnpm format`                    |
| Build packages                     | `pnpm build`                                  |
| Bundle budgets                     | `pnpm size` (after `pnpm build`)              |
| Package contents                   | `pnpm pack:check`                             |
| Benchmarks                         | `pnpm bench`                                  |
| Everything CI runs                 | `pnpm check`                                  |

Tests and dev servers resolve workspace packages to their TypeScript sources
(`@startupjafari/source` export condition), so no build is needed while developing.
`pnpm size` and `pnpm pack:check` measure the built `dist` output.

## Layout

```
packages/core     math core (scales, geometry, layout, data, chart models)
packages/themes   tokens, CSS stylesheet, createTheme
packages/canvas   Canvas 2D renderer
packages/react    React components (ChartView shell, primitives, charts)
packages/export   SVG/PNG/WebP/CSV export
packages/charts   @startupjafari/charts umbrella
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

## Releasing

The six packages in `packages/*` share one version. Apps and benchmarks are private.

1. Bump `version` in every `packages/*/package.json` (and the root/apps for
   consistency); move the `[Unreleased]` notes in `CHANGELOG.md` under the new
   version with the date and update the compare links at the bottom.
2. Verify from a clean tree: `pnpm release:check` (clean, format, lint, types,
   tests, build, size budgets, `pack:check` with the consumer smoke test).
3. Commit `chore(release): x.y.z`, push it and wait for CI. Then tag and push the tag:

   ```bash
   git tag -a vx.y.z -m "Jafari Charts x.y.z" && git push origin vx.y.z
   ```

   The **Release** workflow (`.github/workflows/release.yml`) checks that the tag matches
   every package version, runs `pnpm release:check`, packs with pnpm (rewriting
   `workspace:*` and applying `publishConfig.exports`, which drops the
   `@startupjafari/source` condition), publishes the tarballs with npm in dependency order
   with provenance (versions already on npm are skipped, so a failed run can be re-run)
   and creates the GitHub release from the `CHANGELOG.md` section. Running the workflow by
   hand, or a pull request touching it, does everything except publishing.

   npm credentials: configure npm trusted publishing for each of the six packages
   (package settings → Trusted Publisher → GitHub Actions, repository
   `startupjafari/jafari-charts`, workflow `release.yml`); until then the workflow uses the
   `NPM_TOKEN` secret (a granular token with read and write access to `@startupjafari`):
   `gh secret set NPM_TOKEN -R startupjafari/jafari-charts`.

4. Manual fallback, as the npm user `startupjafari` (two-factor authentication on):

   ```bash
   npm whoami                                        # must print startupjafari
   node scripts/release.mjs pack release             # pnpm pack, dependency order
   node scripts/release.mjs publish release --dry-run
   node scripts/release.mjs publish release          # npm may ask for a one-time password
   ```

5. Check: `npm view @startupjafari/charts version`, then install the package in a fresh
   app.

## Progress log

### 2026-11-27 — release 0.1.0 prepared

- Repository moved to github.com/startupjafari/jafari-charts (history authored by
  startupjafari). CI green: quality, React 18, browser suite.
- `CHANGELOG.md` 0.1.0, tag `v0.1.0`; npm publish is done by the owner (see
  "Releasing").
- Packages renamed from `@jafari/*` to `@startupjafari/*` before the first npm
  publish: the `@jafari` npm scope belongs to someone else, the owner's npm account
  is `startupjafari`. The `@startupjafari/source` export condition was renamed too.

### 2026-11-26 (later) — owner approved publishing and integration

- MIT confirmed; repository to be public on GitHub; npm publish (scope decided on 2026-11-27: `@startupjafari`).
- Added: export tests in browsers, Firefox/WebKit/mobile Safari runs and visual
  baselines in Docker (173 tests pass in the container), zoom/pan/brush for
  scatter, category axes and calendar, controlled calendar/treemap state, shared
  en/ru/kk messages, Russian docs, localised chart names.

### 2026-11-26 — Phases 1–6 complete; 7 waiting for the owner

- All 20 chart types implemented on two shared engines (cartesian, polar) plus
  dedicated models (heatmap, calendar, scatter, radar, funnel, treemap); every
  model is pure, in the core, and unit-tested.
- Tests: 318 unit/component/SSR/hydration tests (Vitest, also green on React
  18.3), 51 Playwright tests (interaction, touch, zoom/brush, locales,
  responsive 320–1440 px, axe in both themes, 116 visual baselines).
- Sizes (gzip, consumer build): base core 9.9 KB; React layer for LineChart
  13.8 KB; LineChart with all core it needs + CSS 33.3 KB; everything 65.8 KB.
  Next.js 15 route with LineChart + DonutChart: 41 KB (optimizePackageImports).
- Benchmarks: benchmarks/results/REPORT.md (browser), core.json (µs-level hit
  tests), leak check (no leak). Two performance fixes came from them: canvas
  path flushing and separate static/interactive SVG layers.
- Storybook (`pnpm storybook`), docs site (`pnpm dev:docs`, 33 routes), CI.

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

Next: the owner's decisions on Phase 7 (StudentHub) and on npm publishing /
repository visibility; then a GPU-machine benchmark to revisit canvas thresholds.
