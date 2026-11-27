import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end and visual tests for the documentation site (`apps/docs`). Kept apart
 * from `playwright.config.ts`, which drives the playground scenes.
 *
 *   pnpm test:e2e:docs              functional + a11y suites (local browsers)
 *   pnpm test:visual:docs           visual baselines, in the pinned Playwright image
 *   pnpm test:visual:docs:update    refresh the baselines after an intended change
 */
const PORT = 5182;

export default defineConfig({
  testDir: 'tests/e2e-docs',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // `--bypass-lock`: a `pnpm dev:docs` server may already be running for this project.
  webServer: {
    command: `node node_modules/vite/bin/vite.js apps/docs --port ${PORT} --strictPort --bypass-lock`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
