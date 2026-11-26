import react from '@vitejs/plugin-react';
import { defaultClientConditions, defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Resolve workspace packages to their TypeScript sources (instant HMR, no build step).
  resolve: { conditions: ['@jafari/source', ...defaultClientConditions] },
});
