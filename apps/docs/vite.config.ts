import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defaultClientConditions, defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Hash routing: relative asset URLs let the built site be served from any sub-path.
  base: './',
  // Resolve workspace packages to their TypeScript sources (instant HMR, no build step).
  resolve: { conditions: ['@startupjafari/source', ...defaultClientConditions] },
  server: { port: 5180, strictPort: true },
  preview: { port: 5180, strictPort: true },
});
