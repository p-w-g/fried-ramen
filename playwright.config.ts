import { defineConfig, devices } from '@playwright/test';

const devPort = 4173;
const previewPort = 4174;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  expect: {
    toHaveScreenshot: {
      threshold: 0,
      // Full-page captures would paint the sticky navbar over the middle of
      // the page; pinning it to the end keeps every card visible.
      stylePath: './e2e/screenshot.css',
    },
  },
  projects: [
    {
      name: 'mobile',
      testIgnore: /(offline|update)\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        baseURL: `http://localhost:${devPort}`,
        serviceWorkers: 'block',
      },
    },
    {
      // The production build: service worker on, and Vue's error handling
      // as shipped (dev builds rethrow errors that prod only logs).
      name: 'production',
      testMatch: /(offline|errors|update)\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        baseURL: `http://localhost:${previewPort}`,
        serviceWorkers: 'allow',
      },
    },
  ],
  webServer: [
    {
      command: `npx vite --port ${devPort} --strictPort`,
      port: devPort,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run build && E2E_SIMULATED_RELEASE=1 npx vite preview --port ${previewPort} --strictPort`,
      port: previewPort,
      // Always rebuild: a reused preview server would test a stale build.
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
