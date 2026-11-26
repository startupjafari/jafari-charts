// Performance benchmarks for Jafari Charts (Chromium, production build).
// Usage: pnpm bench [--quick]
// Results: benchmarks/results/latest.json and benchmarks/results/REPORT.md
/* global window */
import { chromium } from '@playwright/test';
import { execSync, spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { cpus, totalmem } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const quick = process.argv.includes('--quick');
const PORT = 5175;
const URL = `http://localhost:${PORT}`;

console.log('Building playground (production)…');
execSync('pnpm --filter @jafari/charts-playground build', { cwd: root, stdio: 'ignore' });
const server = spawn(
  'pnpm',
  [
    '--filter',
    '@jafari/charts-playground',
    'exec',
    'vite',
    'preview',
    '--port',
    String(PORT),
    '--strictPort',
  ],
  {
    cwd: root,
    stdio: 'ignore',
    detached: true,
  },
);
const stopServer = () => {
  try {
    process.kill(-server.pid);
  } catch {
    /* already stopped */
  }
};
process.on('exit', stopServer);
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(URL)).ok) break;
  } catch {
    await new Promise((r) => setTimeout(r, 500));
  }
}

const browser = await chromium.launch({
  args: ['--enable-precise-memory-info', '--js-flags=--expose-gc'],
});

const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : NaN;
};
const pct = (a, p) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : NaN;
};
const round = (v) => (Number.isFinite(v) ? Math.round(v * 10) / 10 : null);

async function open(query) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  await page.addInitScript(() => {
    window.__longTasks = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__longTasks.push(e.duration);
    }).observe({ type: 'longtask', buffered: true });
  });
  await page.goto(`${URL}/?scene=bench&${query}`);
  await page.waitForFunction(() => Boolean(window.__bench));
  return page;
}
const longTasks = (page) => page.evaluate(() => window.__longTasks.splice(0));
const heapMB = (page) =>
  page.evaluate(() => {
    window.gc?.();
    return performance.memory ? performance.memory.usedJSHeapSize / 1048576 : NaN;
  });
const call = (page, fn, ...args) => page.evaluate(([f, a]) => window.__bench[f](...a), [fn, args]);

const results = {
  meta: {
    date: new Date().toISOString(),
    cpu: cpus()[0]?.model,
    cores: cpus().length,
    memoryGB: Math.round(totalmem() / 1e9),
    browser: browser.version(),
    quick,
  },
  scaling: [],
  multi: [],
  scenarios: [],
};

// 1. Single-chart scaling: mount, update, hover latency, DOM size, heap.
const sizes = quick ? [365, 10_000, 100_000] : [30, 90, 365, 1_000, 10_000, 100_000, 1_000_000];
for (const chart of ['line', 'area', 'bar']) {
  for (const points of sizes) {
    if (chart === 'bar' && points > 10_000) continue; // one band per datum; beyond this bars are sub-pixel
    for (const renderer of ['svg', 'canvas']) {
      if (renderer === 'canvas' && points < 1_000) continue;
      const mounts = [];
      let page;
      for (let rep = 0; rep < (points >= 1e6 ? 1 : 3); rep++) {
        page?.close();
        page = await open(`chart=${chart}&points=${points}&renderer=${renderer}`);
        mounts.push(await call(page, 'mount'));
      }
      await longTasks(page);
      const updates = [];
      for (let k = 0; k < (points >= 1e6 ? 2 : 5); k++)
        updates.push(await call(page, 'update', k + 2));
      const hover = await call(page, 'hover', 40);
      const lt = await longTasks(page);
      const row = {
        chart,
        renderer,
        points,
        mountMs: round(median(mounts)),
        updateMs: round(median(updates)),
        hoverP50Ms: round(pct(hover, 0.5)),
        hoverP95Ms: round(pct(hover, 0.95)),
        longTasksDuringHover: lt.length,
        domNodes: await call(page, 'domNodes'),
        heapMB: round(await heapMB(page)),
      };
      results.scaling.push(row);
      console.log(JSON.stringify(row));
      await page.close();
    }
  }
}

// 2. Many charts on one page (365 points each).
for (const charts of quick ? [10, 50] : [1, 10, 20, 50]) {
  const page = await open(`chart=line&points=365&charts=${charts}`);
  const mountMs = await call(page, 'mount');
  await longTasks(page);
  const filter = [];
  for (let k = 0; k < 4; k++) filter.push(await call(page, 'update', k + 5));
  const resize = [];
  for (let k = 0; k < 4; k++) resize.push(await call(page, 'resize', k % 2 ? 900 : 640));
  const hover = await call(page, 'hover', 40);
  const lt = await longTasks(page);
  const row = {
    charts,
    mountMs: round(mountMs),
    filterSwitchMs: round(median(filter)),
    resizeMs: round(median(resize)),
    hoverP95Ms: round(pct(hover, 0.95)),
    longTasks: lt.length,
    longestTaskMs: round(Math.max(0, ...lt)),
    domNodes: await call(page, 'domNodes'),
    heapMB: round(await heapMB(page)),
  };
  results.multi.push(row);
  console.log(JSON.stringify(row));
  await page.close();
}

// 3. Streaming updates (sliding window of 1 000 points, 60 ticks).
{
  const page = await open('chart=line&points=1000');
  await call(page, 'mount');
  const ticks = [];
  for (let k = 0; k < (quick ? 20 : 60); k++) ticks.push(await call(page, 'stream'));
  results.scenarios.push({
    name: 'streaming (1 000-point window)',
    p50Ms: round(pct(ticks, 0.5)),
    p95Ms: round(pct(ticks, 0.95)),
  });
  await page.close();
}

// 4. Leak check: mount/unmount 10 charts repeatedly; heap and DOM must return to baseline.
{
  const page = await open('chart=line&points=365&charts=10');
  await call(page, 'mount');
  await call(page, 'unmount');
  const baseHeap = await heapMB(page);
  const baseNodes = await call(page, 'domNodes');
  const cycles = quick ? 20 : 50;
  for (let k = 0; k < cycles; k++) {
    await call(page, 'mount');
    await call(page, 'unmount');
  }
  const endHeap = await heapMB(page);
  results.scenarios.push({
    name: `leak check (${cycles} × mount/unmount of 10 charts)`,
    heapStartMB: round(baseHeap),
    heapEndMB: round(endHeap),
    heapDeltaMB: round(endHeap - baseHeap),
    domNodesAfter: (await call(page, 'domNodes')) - baseNodes,
  });
  await page.close();
}

await browser.close();
stopServer();

const outDir = join(root, 'benchmarks', 'results');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'latest.json'), `${JSON.stringify(results, null, 2)}\n`);

const table = (rows) => {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  return [
    `| ${cols.join(' | ')} |`,
    `| ${cols.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${cols.map((c) => r[c] ?? '—').join(' | ')} |`),
  ].join('\n');
};
const m = results.meta;
writeFileSync(
  join(outDir, 'REPORT.md'),
  `# Benchmark report\n\nGenerated ${m.date} · ${m.cpu} (${m.cores} cores, ${m.memoryGB} GB) · Chromium ${m.browser}${quick ? ' · quick run' : ''}\n\n` +
    'Production build, animations off, viewport 1000×800. Times include layout and paint of the next frame. ' +
    'Each machine produces different absolute numbers; compare runs on the same machine.\n\n' +
    `## Single chart\n\n${table(results.scaling)}\n\n## Many charts (365 points each)\n\n${table(results.multi)}\n\n## Scenarios\n\n${table(results.scenarios)}\n`,
);
console.log(`\nWrote ${join(outDir, 'REPORT.md')}`);
process.exit(0);
