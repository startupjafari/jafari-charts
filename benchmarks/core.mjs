// Core (framework-free) micro-benchmarks against the built @jafari/charts-core.
// Usage: node benchmarks/core.mjs  → prints a table and writes results/core.json
import { buildCartesianModel, buildScatterModel, lttb, minMaxDownsample, nearestIndex } from '@jafari/charts-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const rng = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const time = (fn, reps = 1) => {
  fn(); // warm-up
  const t0 = performance.now();
  for (let i = 0; i < reps; i++) fn();
  return (performance.now() - t0) / reps;
};
const rows = [];
const add = (name, ms, note = '') => rows.push({ operation: name, ms: Number(ms.toPrecision(3)), note });

for (const n of [100_000, 1_000_000]) {
  const r = rng(7);
  const xs = Float64Array.from({ length: n }, (_, i) => i);
  const ys = Float64Array.from({ length: n }, () => r() * 100);
  add(`LTTB ${n.toLocaleString('en')} → 2 000`, time(() => lttb(xs, ys, 2000), 3));
  add(`min-max ${n.toLocaleString('en')} → 2 000`, time(() => minMaxDownsample(xs, ys, 2000), 3));
  add(`nearestIndex in ${n.toLocaleString('en')}`, time(() => nearestIndex(xs, r() * n), 10_000), 'per hover');
  let model;
  add(
    `line model build, ${n.toLocaleString('en')} points`,
    time(() => {
      model = buildCartesianModel({
        width: 1000,
        height: 300,
        x: { type: 'number', values: xs, labels: [] },
        series: [{ id: 'a', label: 'a', color: '#000', type: 'line', values: ys }],
      });
    }, 3),
    'incl. downsampling',
  );
  add(`line hit test, ${n.toLocaleString('en')} points`, time(() => model.hitTest(50 + r() * 900, 150), 10_000), 'per pointer move');
}

for (const n of [10_000, 100_000]) {
  const r = rng(3);
  const groups = [
    { id: 'g', label: 'g', color: '#000', xs: Float64Array.from({ length: n }, () => r() * 100), ys: Float64Array.from({ length: n }, () => r() * 100) },
  ];
  let model;
  add(`scatter model build, ${n.toLocaleString('en')} points`, time(() => (model = buildScatterModel({ width: 1000, height: 600, groups })), 3));
  // The k-d tree is built lazily on the first hit test.
  add(`scatter k-d tree build, ${n.toLocaleString('en')} points`, time(() => buildScatterModel({ width: 1000, height: 600, groups }).hitTest(500, 300), 3) - rows.at(-1).ms);
  model.hitTest(500, 300);
  add(`scatter hit test, ${n.toLocaleString('en')} points`, time(() => model.hitTest(60 + r() * 900, 20 + r() * 540), 10_000), 'per pointer move');
}

console.table(rows);
const out = join(import.meta.dirname, 'results');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'core.json'), `${JSON.stringify({ date: new Date().toISOString(), node: process.version, rows }, null, 2)}\n`);
