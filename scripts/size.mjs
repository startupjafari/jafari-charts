// Bundle-size check: builds realistic consumer imports against the *published* dist
// output (minified, tree-shaken, React external) and reports gzip sizes vs budgets.
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';

const root = resolve(import.meta.dirname, '..');
// Entries live inside the benchmarks workspace package so @startupjafari/* resolve to dist.
const tmp = join(root, 'benchmarks', '.size-tmp');

const use = (names, from) => `import { ${names} } from '${from}';\nglobalThis.__jc = [${names}];`;
const all = (from) => `import * as m from '${from}';\nglobalThis.__jc = m;`;

const CORE_EXTERNAL = [
  '@startupjafari/charts-core',
  '@startupjafari/charts-themes',
  '@startupjafari/charts-canvas',
];

/**
 * name → [entry source, gzip budget in KB, extra externals]. Each entry is built like a consumer
 * app (full minification, tree shaking) and keeps only what it references.
 */
// +1 KB (Nov 2026): localised chart-type names (ru/kk) for accessible descriptions.
const scenarios = {
  'core: scales + ticks + format': [
    use(
      'createLinearScale, createTimeScale, linearTicks, formatNumber',
      '@startupjafari/charts-core',
    ),
    5,
  ],
  'core: base (scales, ticks, geometry, curves, data, formatting)': [
    use(
      'createLinearScale, createLogScale, createTimeScale, createBandScale, createPointScale, createOrdinalScale, linearTicks, niceDomain, PathBuilder, drawLine, drawArea, drawArc, drawRoundedRect, drawSymbol, drawCurve, stack, lttb, minMaxDownsample, numericColumn, timeColumn, toNumber, toTime, formatNumber, formatCompact, formatDate, getMessages, bisectLeft, nearestIndex, extent, createStore, frameThrottle, zoomDomain, tween, resolveEasing',
      '@startupjafari/charts-core',
    ),
    15,
  ],
  // 20 chart models; apps only pay for the models they import (see the app rows).
  'core: everything (incl. chart models)': [all('@startupjafari/charts-core'), 39],
  'react layer: LineChart (core external)': [
    use('LineChart', '@startupjafari/charts-react'),
    25,
    CORE_EXTERNAL,
  ],
  // 30 → 32 KB: 2D scatter zoom/brush, calendar range selection, controlled drill-down.
  'react layer: all components (core external)': [
    all('@startupjafari/charts-react'),
    32,
    CORE_EXTERNAL,
  ],
  // Includes the stylesheet (~2.6 KB) and the Kazakh ICU fallback (~1.2 KB).
  // 34 → 36 KB: every chart's strings (funnel/treemap/heatmap, zoom announcements) live in the
  // shared en/ru/kk messages (~0.5 KB), and the cartesian engine gained the shared zoom/brush
  // gestures with category windows, keyboard pan and live-region announcements (~1.8 KB).
  // 37 → 38 KB (Nov 2026, measured +1.1 KB): wrapped category labels (balanced word wrap
  // with hyphen breaks, multi-line axis layout and <tspan> rendering, ~0.6 KB), integer
  // value ticks (~0.1 KB) and per-bar `colorBy` colours (~0.2 KB); the cartesian engine
  // ships them to every cartesian chart. The same +1 KB applies to the two rows below.
  'app: LineChart (React layer + core it needs)': [use('LineChart', '@startupjafari/charts'), 38],
  'app: AreaChart + BarChart + Sparkline': [
    use('AreaChart, BarChart, Sparkline', '@startupjafari/charts'),
    38,
  ],
  'app: everything from @startupjafari/charts': [all('@startupjafari/charts'), 71],
  'canvas renderer (lazy chunk, core external)': [
    all('@startupjafari/charts-canvas'),
    3,
    ['@startupjafari/charts-core'],
  ],
  'export module': [all('@startupjafari/charts/export'), 4],
  'themes: tokens only': [
    use('lightTheme, darkTheme, createTheme', '@startupjafari/charts-themes'),
    2,
  ],
};

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
let failed = false;
const rows = [];
for (const [name, [source, budget, externals = []]] of Object.entries(scenarios)) {
  const id = name.replace(/[^a-z0-9]+/gi, '-');
  const entry = join(tmp, `${id}.js`);
  writeFileSync(entry, `${source}\n`);
  const outDir = join(tmp, id);
  await build({
    root,
    logLevel: 'silent',
    configFile: false,
    build: {
      outDir,
      emptyOutDir: true,
      minify: true,
      modulePreload: false,
      rollupOptions: {
        input: entry,
        external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client', ...externals],
        output: { entryFileNames: 'out.js', chunkFileNames: 'chunk-[name].js' },
      },
    },
  });
  // Lazy chunks are not part of the initial bundle and are not counted here.
  const code = readFileSync(join(outDir, 'out.js'));
  const min = code.length / 1024;
  const gz = gzipSync(code, { level: 9 }).length / 1024;
  const ok = gz <= budget;
  if (!ok) failed = true;
  rows.push({
    scenario: name,
    'min KB': min.toFixed(1),
    'gzip KB': gz.toFixed(1),
    'budget KB': budget,
    status: ok ? 'ok' : 'OVER',
  });
}
console.table(rows);
writeFileSync(join(root, 'benchmarks', 'size.json'), `${JSON.stringify(rows, null, 2)}\n`);
rmSync(tmp, { recursive: true, force: true });
if (failed) {
  console.error('Bundle size budget exceeded.');
  process.exit(1);
}
