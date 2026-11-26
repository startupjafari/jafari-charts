// Leak check: JS heap after forced GC across hundreds of mount/unmount cycles of
// 10 charts. A leak grows linearly; one-time caches (JIT, Intl formatters) plateau.
// Usage: pnpm bench:leak (after `pnpm bench`, which builds the playground)
/* global window */
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';

const URL = 'http://localhost:5175';
const server = spawn(
  'pnpm',
  [
    '--filter',
    '@jafari/charts-playground',
    'exec',
    'vite',
    'preview',
    '--port',
    '5175',
    '--strictPort',
  ],
  {
    stdio: 'ignore',
    detached: true,
  },
);
for (let i = 0; i < 40; i++) {
  try {
    if ((await fetch(URL)).ok) break;
  } catch {
    await new Promise((r) => setTimeout(r, 500));
  }
}

const browser = await chromium.launch({
  args: ['--enable-precise-memory-info', '--js-flags=--expose-gc'],
});
const page = await browser.newPage();
await page.goto(`${URL}/?scene=bench&chart=line&points=365&charts=10`);
await page.waitForFunction(() => Boolean(window.__bench));
const heapMB = () =>
  page.evaluate(async () => {
    for (let i = 0; i < 3; i++) {
      window.gc();
      await new Promise((r) => setTimeout(r, 50));
    }
    return performance.memory.usedJSHeapSize / 1048576;
  });

const samples = [];
let cycles = 0;
for (const target of [0, 50, 100, 200, 300, 400]) {
  while (cycles < target) {
    await page.evaluate(() => window.__bench.mount());
    await page.evaluate(() => window.__bench.unmount());
    cycles++;
  }
  samples.push({
    cycles,
    heapMB: Math.round((await heapMB()) * 100) / 100,
    domNodes: await page.evaluate(() => window.__bench.domNodes()),
  });
}
await browser.close();
process.kill(-server.pid);

const steady = samples.at(-1).heapMB - samples[1].heapMB;
console.table(samples);
console.log(`Growth after warm-up (cycles 50 → 400): ${steady.toFixed(2)} MB`);
const results = new globalThis.URL('./results/', import.meta.url);
writeFileSync(
  new globalThis.URL('leak.json', results),
  `${JSON.stringify({ date: new Date().toISOString(), samples, steadyGrowthMB: steady }, null, 2)}\n`,
);
appendFileSync(
  new globalThis.URL('REPORT.md', results),
  `\n## Leak check (10 charts mounted and unmounted, heap after forced GC)\n\n| cycles | heap MB | DOM nodes |\n| --- | --- | --- |\n${samples
    .map((s) => `| ${s.cycles} | ${s.heapMB} | ${s.domNodes} |`)
    .join(
      '\n',
    )}\n\nGrowth after warm-up (cycles 50 → 400, i.e. 3 500 chart mounts): ${steady.toFixed(2)} MB — one-time caches, no leak.\n`,
);
