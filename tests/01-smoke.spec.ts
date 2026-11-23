/**
 * LESSON 1 — The basics: go to a page, find things, make assertions.
 *
 * - `page.goto('/')` opens baseURL from playwright.config.ts.
 * - `getByRole` finds elements the way a screen reader would (button, heading, ...).
 *   It is the most robust locator: it survives CSS and markup changes.
 * - `expect(...)` assertions retry automatically until they pass or time out,
 *   so you almost never need manual waits.
 */
import { test, expect } from './fixtures';

test('app loads and shows today\'s workout', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Workout Tracker');
  // The clock is frozen to Tuesday, March 10 (see fixtures.ts).
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tuesday, March 10');
  await expect(page.getByRole('heading', { name: 'Lower Body Push' })).toBeVisible();
});

test('tab bar has the four sections', async ({ page }) => {
  await page.goto('/');

  const tabs = page.getByRole('navigation', { name: 'Sections' }).getByRole('button');
  await expect(tabs).toHaveText(['Today', 'Month', 'Progress', 'Settings']);
  await expect(page.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-current', 'page');
});

test('runs without JavaScript errors', async ({ page }) => {
  // Listen for uncaught exceptions before loading the page.
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  for (const tab of ['Month', 'Progress', 'Settings', 'Today']) {
    await page.getByRole('button', { name: tab, exact: true }).click();
  }
  expect(errors).toEqual([]);
});
