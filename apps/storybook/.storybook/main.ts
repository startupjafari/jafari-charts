import type { StorybookConfig } from '@storybook/react-vite';
import { defaultClientConditions } from 'vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.tsx'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  // Resolve workspace packages to their TypeScript sources (same as the playground).
  viteFinal: (cfg) => ({
    ...cfg,
    resolve: { ...cfg.resolve, conditions: ['@jafari/source', ...defaultClientConditions] },
  }),
};

export default config;
