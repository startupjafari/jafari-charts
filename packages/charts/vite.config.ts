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

export default defineConfig(
  libConfig(import.meta.dirname, {
    entries: {
      index: 'src/index.ts',
      core: 'src/core.ts',
      themes: 'src/themes.ts',
      export: 'src/export.ts',
      // Kept as separate local modules so `import { LineChart } from '@startupjafari/charts'`
      // resolves to one chart family under barrel optimisation.
      ...Object.fromEntries(families.map((f) => [`react/${f}`, `src/react/${f}.ts`])),
    },
  }),
);
