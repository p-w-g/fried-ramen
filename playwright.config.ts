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
      // Anti-aliasing on bordered rounded corners varies by a few pixels
      // between identical runs; any real change moves far more than this.
      maxDiffPixels: 20,
      // Full-page captures would paint the sticky navbar over the middle of
      // the page; pinning it to the end keeps every card visible.
      stylePath: './e2e/screenshot.css',
    },
  },
  projects: [
    {
      name: 'mobile',
      testIgnore: /(offline|update|manifest)\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        baseURL: `http://localhost:${devPort}`,
        serviceWorkers: 'block',
      },
    },
    {
      // Two panes side by side, as on a tablet on its side.
      name: 'ipad-mini-landscape',
      testMatch: /(visual|layout)\.spec\.ts/,
      use: {
        ...devices['iPad Mini landscape'],
        // Its layout, not Safari's engine: the other projects run Chromium too.
        defaultBrowserType: 'chromium',
        baseURL: `http://localhost:${devPort}`,
        serviceWorkers: 'block',
      },
    },
    {
      // An unfolded phone's inner screen, e.g. a Galaxy Z Fold, held
      // upright. Estimated from the Fold 7: 1968x2184 pixels at 2.625.
      name: 'fold-inner',
      testMatch: /(visual|layout)\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 750, height: 832 },
        baseURL: `http://localhost:${devPort}`,
        serviceWorkers: 'block',
      },
    },
    {
      // The production build: service worker on, and Vue's error handling
      // as shipped (dev builds rethrow errors that prod only logs).
      name: 'production',
      testMatch: /(offline|errors|update|manifest)\.spec\.ts/,
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
