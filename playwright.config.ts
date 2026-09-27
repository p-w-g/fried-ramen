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
      // Galaxy Z Fold 8 unfolded: a wide 4:3 inner screen, 816x616 CSS
      // pixels at a pixel ratio of 3 (2448x1848), per phone-simulator.com.
      // The page loses 76px to the browser's bars, as in the Pixel 7 profile.
      name: 'fold-8-inner',
      testMatch: /(visual|layout)\.spec\.ts/,
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 816, height: 540 },
        deviceScaleFactor: 3,
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
