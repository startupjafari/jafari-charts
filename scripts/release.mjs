// Release helper for the GitHub "Release" workflow (also usable locally).
//
//   node scripts/release.mjs version            print the shared package version
//   node scripts/release.mjs check-tag vX.Y.Z   every package is at X.Y.Z
//   node scripts/release.mjs pack DIR           pnpm pack every package into DIR
//   node scripts/release.mjs publish DIR [--dry-run]
//                                              npm publish the tarballs in dependency
//                                              order, skipping versions already on npm
//   node scripts/release.mjs notes vX.Y.Z       the CHANGELOG section of that version
//
// pnpm packs (it rewrites workspace:* ranges and applies publishConfig);
// npm publishes (provenance and npm trusted publishing).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
// Dependency order: a package is published after everything it depends on.
const PACKAGES = ['core', 'themes', 'canvas', 'export', 'react', 'charts'];

const manifest = (dir) =>
  JSON.parse(readFileSync(join(root, 'packages', dir, 'package.json'), 'utf8'));
const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: root, encoding: 'utf8', ...opts });
const fail = (msg) => {
  console.error(`release: ${msg}`);
  process.exit(1);
};

function version() {
  const versions = new Set(PACKAGES.map((d) => manifest(d).version));
  if (versions.size !== 1) fail(`packages disagree on the version: ${[...versions].join(', ')}`);
  return [...versions][0];
}

function checkTag(tag) {
  const v = version();
  if (tag !== `v${v}`) fail(`tag ${tag} does not match the package version ${v}`);
  console.log(`tag ${tag} matches every package`);
}

function pack(dir) {
  const out = resolve(dir);
  mkdirSync(out, { recursive: true });
  const order = [];
  for (const d of PACKAGES) {
    const { name, version: v } = manifest(d);
    const before = new Set(readdirSync(out));
    run('pnpm', ['pack', '--pack-destination', out], { cwd: join(root, 'packages', d) });
    const file = readdirSync(out).find((f) => !before.has(f) && f.endsWith('.tgz'));
    if (!file) fail(`pnpm pack produced no tarball for ${name}`);
    order.push(`${name} ${v} ${file}`);
  }
  writeFileSync(join(out, 'order.txt'), `${order.join('\n')}\n`);
  console.log(order.join('\n'));
}

function published(name, v) {
  try {
    return run('npm', ['view', `${name}@${v}`, 'version'], { stdio: 'pipe' }).trim() === v;
  } catch {
    return false; // 404: not published yet
  }
}

function publish(dir, dryRun) {
  const out = resolve(dir);
  const lines = readFileSync(join(out, 'order.txt'), 'utf8').trim().split('\n');
  for (const line of lines) {
    const [name, v, file] = line.split(' ');
    if (published(name, v)) {
      console.log(`${name}@${v} is already on npm, skipped`);
      continue;
    }
    const args = ['publish', join(out, file), '--access', 'public'];
    if (dryRun) args.push('--dry-run');
    else if (process.env.GITHUB_ACTIONS === 'true') args.push('--provenance');
    run('npm', args, { stdio: 'inherit' });
  }
}

function notes(tag) {
  const v = tag.replace(/^v/, '');
  const text = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
  const start = text.indexOf(`## [${v}]`);
  if (start < 0) fail(`CHANGELOG.md has no section for ${v}`);
  const body = text.slice(text.indexOf('\n', start) + 1);
  const end = body.search(/^## \[|^\[[^\]]+\]: /m);
  process.stdout.write(`${(end < 0 ? body : body.slice(0, end)).trim()}\n`);
}

const [command, arg, flag] = process.argv.slice(2);
switch (command) {
  case 'version':
    console.log(version());
    break;
  case 'check-tag':
    checkTag(arg ?? fail('check-tag needs a tag'));
    break;
  case 'pack':
    pack(arg ?? fail('pack needs a directory'));
    break;
  case 'publish':
    publish(arg ?? fail('publish needs a directory'), flag === '--dry-run');
    break;
  case 'notes':
    notes(arg ?? fail('notes needs a tag'));
    break;
  default:
    fail('usage: release.mjs version|check-tag|pack|publish|notes');
}
