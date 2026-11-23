import { test as base, expect } from '@playwright/test';

/**
 * Shared setup for every test. Import { test, expect } from here instead of '@playwright/test'.
 *
 * 1. Freeze the clock. The app is all about "today" and "this week", so a fixed date
 *    keeps tests from changing behaviour depending on when they run.
 * 2. Block Firebase. With no Firebase SDK loaded the app falls back to "on this device"
 *    mode and saves to localStorage, so tests never touch a real account.
 * 3. Block Google Fonts so tests don't depend on the internet.
 */
export const FIXED_NOW = new Date('2026-03-10T09:00:00-04:00'); // a Tuesday

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.clock.setFixedTime(FIXED_NOW);
    await page.route(/gstatic\.com\/firebasejs|fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
    await use(page);
  },
});

export { expect };
