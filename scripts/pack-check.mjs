// Packs every publishable package, verifies tarball contents and manifests, then
// installs the tarballs into a fresh project and imports/renders from them.
import { execSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const packages = ['core', 'themes', 'canvas', 'export', 'react', 'charts'];
const work = mkdtempSync(join(tmpdir(), 'jc-pack-'));
const tarballs = {};
const problems = [];
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString();

for (const dir of packages) {
  const pkgDir = join(root, 'packages', dir);
  const out = join(work, 'tgz');
  mkdirSync(out, { recursive: true });
  run(`pnpm pack --pack-destination ${out}`, pkgDir);
  const name = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).name;
  const file = readdirSync(out).find(
    (f) =>
      f.startsWith(name.replace('@', '').replace('/', '-')) &&
      !Object.values(tarballs).includes(join(out, f)),
  );
  const tgz = join(out, file);
  tarballs[name] = tgz;
  const files = run(`tar -tzf ${tgz}`).split('\n').filter(Boolean);
  const manifest = JSON.parse(run(`tar -xzOf ${tgz} package/package.json`));
  const check = (ok, msg) => ok || problems.push(`${name}: ${msg}`);
  check(files.includes('package/README.md'), 'README.md missing');
  check(files.includes('package/LICENSE'), 'LICENSE missing');
  check(
    !files.some((f) => f.includes('/src/') || f.endsWith('.test.js')),
    'contains sources or tests',
  );
  check(!JSON.stringify(manifest).includes('workspace:'), 'workspace: ranges not rewritten');
  check(
    !JSON.stringify(manifest.exports).includes('@jafari/source'),
    'development export condition leaked',
  );
  for (const [sub, target] of Object.entries(manifest.exports)) {
    const targets = typeof target === 'string' ? [target] : Object.values(target);
    for (const t of targets)
      check(
        files.includes(`package/${t.replace('./', '')}`),
        `export ${sub} → ${t} not in tarball`,
      );
  }
  const kb = (readFileSync(tgz).length / 1024).toFixed(1);
  console.log(`${name.padEnd(24)} ${String(files.length).padStart(4)} files  ${kb} KB packed`);
}

if (problems.length) {
  console.error(`\n${problems.join('\n')}`);
  process.exit(1);
}

// Consumer smoke test: install tarballs + React from the registry.
const app = join(work, 'app');
mkdirSync(app);
const overrides = Object.fromEntries(Object.entries(tarballs).map(([n, t]) => [n, `file:${t}`]));
writeFileSync(
  join(app, 'package.json'),
  JSON.stringify(
    {
      name: 'consumer',
      private: true,
      type: 'module',
      dependencies: { ...overrides, react: '^19.0.0', 'react-dom': '^19.0.0' },
      overrides,
    },
    null,
    2,
  ),
);
writeFileSync(
  join(app, 'smoke.mjs'),
  `import { createLinearScale, lttb } from '@jafari/charts-core';
import { LineChart, DonutChart } from '@jafari/charts';
import { toCsv } from '@jafari/charts/export';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { existsSync } from 'node:fs';
const s = createLinearScale({ domain: [0, 10], range: [0, 100] });
if (s.map(5) !== 50) throw new Error('core');
if (lttb([0, 1, 2, 3], [0, 1, 0, 1], 3).length !== 3) throw new Error('lttb');
const html = renderToString(h(LineChart, { data: [{ d: '2025-01-01', v: 1 }, { d: '2025-01-02', v: 2 }], xKey: 'd', yKey: 'v' }));
if (!html.includes('<svg')) throw new Error('ssr');
const donut = renderToString(h(DonutChart, { data: [{ k: 'a', v: 1 }], labelKey: 'k', valueKey: 'v' }));
if (!donut.includes('jc-root')) throw new Error('donut');
if (!toCsv([{ a: 1 }]).includes('a')) throw new Error('csv');
if (!existsSync(new URL(import.meta.resolve('@jafari/charts/styles.css')))) throw new Error('styles.css');
console.log('consumer smoke test: ok');
`,
);
run('npm install --no-audit --no-fund --loglevel=error', app);
console.log(run('node smoke.mjs', app).trim());
rmSync(work, { recursive: true, force: true });
