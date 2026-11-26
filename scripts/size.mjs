// Bundle-size check: builds realistic consumer imports against the *published* dist
// output (minified, tree-shaken, React external) and reports gzip sizes vs budgets.
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';

const root = resolve(import.meta.dirname, '..');
// Entries live inside the benchmarks workspace package so @jafari/* resolve to dist.
const tmp = join(root, 'benchmarks', '.size-tmp');

const use = (names, from) => `import { ${names} } from '${from}';\nglobalThis.__jc = [${names}];`;
const all = (from) => `import * as m from '${from}';\nglobalThis.__jc = m;`;

const CORE_EXTERNAL = ['@jafari/charts-core', '@jafari/charts-themes', '@jafari/charts-canvas'];

/**
 * name → [entry source, gzip budget in KB, extra externals]. Each entry is built like a consumer
 * app (full minification, tree shaking) and keeps only what it references.
 */
const scenarios = {
  'core: scales + ticks + format': [
    use('createLinearScale, createTimeScale, linearTicks, formatNumber', '@jafari/charts-core'),
    5,
  ],
  'core: base (scales, ticks, geometry, curves, data, formatting)': [
    use(
      'createLinearScale, createLogScale, createTimeScale, createBandScale, createPointScale, createOrdinalScale, linearTicks, niceDomain, PathBuilder, drawLine, drawArea, drawArc, drawRoundedRect, drawSymbol, drawCurve, stack, lttb, minMaxDownsample, numericColumn, timeColumn, toNumber, toTime, formatNumber, formatCompact, formatDate, getMessages, bisectLeft, nearestIndex, extent, createStore, frameThrottle, zoomDomain, tween, resolveEasing',
      '@jafari/charts-core',
    ),
    15,
  ],
  // 20 chart models; apps only pay for the models they import (see the app rows).
  'core: everything (incl. chart models)': [all('@jafari/charts-core'), 38],
  'react layer: LineChart (core external)': [
    use('LineChart', '@jafari/charts-react'),
    25,
    CORE_EXTERNAL,
  ],
  'react layer: all components (core external)': [all('@jafari/charts-react'), 30, CORE_EXTERNAL],
  // Includes the stylesheet (~2.6 KB) and the Kazakh ICU fallback (~1.2 KB).
  'app: LineChart (React layer + core it needs)': [use('LineChart', '@jafari/charts'), 34],
  'app: AreaChart + BarChart + Sparkline': [
    use('AreaChart, BarChart, Sparkline', '@jafari/charts'),
    34,
  ],
  'app: everything from @jafari/charts': [all('@jafari/charts'), 70],
  'canvas renderer (lazy chunk, core external)': [
    all('@jafari/charts-canvas'),
    3,
    ['@jafari/charts-core'],
  ],
  'export module': [all('@jafari/charts/export'), 4],
  'themes: tokens only': [use('lightTheme, darkTheme, createTheme', '@jafari/charts-themes'), 2],
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
