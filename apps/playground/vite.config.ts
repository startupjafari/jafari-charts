import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defaultClientConditions, defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Resolve workspace packages to their TypeScript sources (instant HMR, no build step).
  resolve: { conditions: ['@startupjafari/source', ...defaultClientConditions] },
  // A single-page sandbox that loads every scene eagerly (the fixtures need it); one
  // large chunk is expected.
  build: { chunkSizeWarningLimit: 1000 },
});
