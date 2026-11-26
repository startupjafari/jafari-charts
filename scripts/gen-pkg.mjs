// One-off generator for consistent package manifests. Kept in repo so manifests can be regenerated.
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';

const common = {
  version: '0.1.0',
  author: 'Mehman Jafari',
  license: 'MIT',
  type: 'module',
  sideEffects: false,
  keywords: ['charts', 'data-visualization', 'svg', 'canvas', 'react', 'typescript'],
};

function exportsFor(entries) {
  const dev = {};
  const pub = {};
  for (const [sub, file] of Object.entries(entries)) {
    const key = sub === 'index' ? '.' : `./${sub}`;
    dev[key] = {
      '@jafari/source': `./src/${file}.ts${file.endsWith('x') ? '' : ''}`,
      types: `./dist/${file.replace(/\.tsx?$/, '')}.d.ts`,
      import: `./dist/${file.replace(/\.tsx?$/, '')}.js`,
      default: `./dist/${file.replace(/\.tsx?$/, '')}.js`,
    };
    pub[key] = { types: dev[key].types, import: dev[key].import, default: dev[key].default };
  }
  dev['./package.json'] = './package.json';
  pub['./package.json'] = './package.json';
  return { dev, pub };
}

const packages = {
  core: {
    name: '@jafari/charts-core',
    description:
      'Framework-independent math core of Jafari Charts: scales, geometry, layout, data processing.',
    entries: { index: 'index' },
  },
  themes: {
    name: '@jafari/charts-themes',
    description: 'Design tokens, light/dark themes and CSS variables for Jafari Charts.',
    entries: { index: 'index' },
    extraExports: { './styles.css': './dist/styles.css' },
    sideEffectsCss: true,
  },
  canvas: {
    name: '@jafari/charts-canvas',
    description: 'Canvas 2D renderer for Jafari Charts scenes (HiDPI, layered, hit-testable).',
    entries: { index: 'index' },
    deps: ['@jafari/charts-core'],
  },
  react: {
    name: '@jafari/charts-react',
    description: 'React components for Jafari Charts.',
    entries: { index: 'index' },
    deps: ['@jafari/charts-core', '@jafari/charts-themes', '@jafari/charts-canvas'],
    peers: true,
  },
  export: {
    name: '@jafari/charts-export',
    description: 'SVG, PNG, WebP and CSV export for Jafari Charts.',
    entries: { index: 'index' },
    deps: ['@jafari/charts-core'],
  },
  charts: {
    name: '@jafari/charts',
    description: 'Jafari Charts — engineered for performance. Beautiful charts. Zero compromise.',
    entries: { index: 'index', core: 'core', themes: 'themes', export: 'export' },
    deps: [
      '@jafari/charts-core',
      '@jafari/charts-themes',
      '@jafari/charts-react',
      '@jafari/charts-export',
    ],
    extraExports: { './styles.css': './dist/styles.css' },
    sideEffectsCss: true,
    peers: true,
  },
};

for (const [dir, p] of Object.entries(packages)) {
  const { dev, pub } = exportsFor(p.entries);
  for (const [k, v] of Object.entries(p.extraExports ?? {})) {
    dev[k] = v;
    pub[k] = v;
  }
  const manifest = {
    name: p.name,
    ...common,
    description: p.description,
    sideEffects: p.sideEffectsCss ? ['**/*.css'] : false,
    exports: dev,
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    files: ['dist', 'README.md', 'LICENSE'],
    scripts: {
      build: 'vite build && tsc -p tsconfig.build.json',
      typecheck: 'tsc -p tsconfig.json --noEmit',
    },
    publishConfig: { access: 'public', exports: pub },
  };
  if (p.deps) manifest.dependencies = Object.fromEntries(p.deps.map((d) => [d, 'workspace:*']));
  if (p.peers) {
    manifest.peerDependencies = { react: '>=18.2.0', 'react-dom': '>=18.2.0' };
  }
  mkdirSync(`packages/${dir}/src`, { recursive: true });
  const target = `packages/${dir}/package.json`;
  const prev = existsSync(target) ? JSON.parse(readFileSync(target, 'utf8')) : {};
  if (prev.devDependencies) manifest.devDependencies = prev.devDependencies;
  writeFileSync(target, JSON.stringify(manifest, null, 2) + '\n');
}
