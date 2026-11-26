import { defineConfig } from 'vite';
import { libConfig } from '../../scripts/vite-lib.ts';

const families = [
  'primitives',
  'cartesian',
  'pie',
  'radial',
  'scatter',
  'radar',
  'heatmap',
  'funnel',
  'treemap',
];

// Component modules are client modules in React Server Components environments.
// Barrels (index.js, entries/*) deliberately have no directive: a "use client"
// barrel makes every chart one client boundary, which defeats tree shaking in
// Next.js. Entries are explicit build inputs so they stay separate files.
export default defineConfig(
  libConfig(import.meta.dirname, {
    entries: {
      index: 'src/index.ts',
      ...Object.fromEntries(families.map((f) => [`entries/${f}`, `src/entries/${f}.ts`])),
    },
    banner: (chunk) =>
      chunk.fileName === 'index.js' || chunk.fileName.startsWith('entries/') ? '' : '"use client";',
  }),
);
