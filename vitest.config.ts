import { defaultClientConditions, defaultServerConditions } from 'vite';
import { defineConfig } from 'vitest/config';

// Workspace packages resolve to their TypeScript sources through this export
// condition, so tests never depend on a prior build.
const SOURCE_CONDITION = '@startupjafari/source';

const resolveSource = {
  resolve: { conditions: [SOURCE_CONDITION, ...defaultClientConditions] },
  ssr: { resolve: { conditions: [SOURCE_CONDITION, ...defaultServerConditions] } },
};

export default defineConfig({
  test: {
    projects: [
      {
        ...resolveSource,
        test: {
          name: 'core',
          environment: 'node',
          include: ['packages/core/src/**/*.test.ts', 'packages/themes/src/**/*.test.ts'],
        },
      },
      {
        ...resolveSource,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: [
            'packages/react/src/**/*.test.{ts,tsx}',
            'packages/canvas/src/**/*.test.{ts,tsx}',
            'packages/export/src/**/*.test.{ts,tsx}',
            'packages/charts/src/**/*.test.{ts,tsx}',
          ],
          exclude: ['**/*.ssr.test.tsx'],
          setupFiles: ['packages/react/src/test/setup.ts'],
        },
      },
      {
        ...resolveSource,
        test: {
          name: 'playground',
          environment: 'jsdom',
          include: ['apps/playground/src/**/*.test.{ts,tsx}'],
          setupFiles: ['packages/react/src/test/setup.ts'],
        },
      },
      {
        ...resolveSource,
        test: {
          name: 'ssr',
          environment: 'node',
          include: [
            'packages/react/src/**/*.ssr.test.tsx',
            'packages/charts/src/**/*.ssr.test.tsx',
          ],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/test/**', '**/index.ts'],
      reporter: ['text-summary', 'html'],
    },
  },
});
