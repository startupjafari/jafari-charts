import { defineConfig } from 'vite';
import { libConfig } from '../../scripts/vite-lib.ts';

export default defineConfig(
  libConfig(import.meta.dirname, {
    entries: {
      index: 'src/index.ts',
      core: 'src/core.ts',
      themes: 'src/themes.ts',
      export: 'src/export.ts',
    },
  }),
);
