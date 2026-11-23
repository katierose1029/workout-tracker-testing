import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,          // fail CI if someone leaves a test.only behind
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',             // record a trace only when a test is retried
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',             // the app's offline cache would otherwise serve stale files
    timezoneId: 'America/New_York',      // dates in the app depend on the local timezone
  },

  // The app is built for iPhone, so test on a phone-sized screen as well as desktop.
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  // Start the local static server for ./app before the tests (skipped when BASE_URL points elsewhere).
  webServer: process.env.BASE_URL ? undefined : {
    command: 'node scripts/serve.mjs',
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
