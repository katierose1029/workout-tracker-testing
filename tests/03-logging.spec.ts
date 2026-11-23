/**
 * LESSON 3 — Filling in forms, and checking data survives a reload.
 *
 * - `locator.fill()` types into an input, `check()` ticks a checkbox.
 * - Chain locators to scope a search: first find the exercise card (an <article>),
 *   then look for "Set 1 weight" *inside* it. This avoids matching the same
 *   label on a different exercise.
 * - `page.reload()` proves the data was saved (here, to localStorage).
 */
import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

/** Finds the card for one exercise on the Today page. */
const exercise = (page: Page, name: string) =>
  page.getByRole('article').filter({ has: page.getByRole('heading', { name, exact: true }) });

test('logging a set updates the counter and survives a reload', async ({ page }) => {
  const squat = exercise(page, 'Smith Machine Box Squat');
  await expect(page.getByText('0 of 18 sets logged')).toBeVisible();

  await squat.getByLabel('Set 1 weight in pounds').fill('95');
  await squat.getByLabel('Set 1 reps').fill('12');
  await squat.getByLabel('Set 1 done').check();

  await expect(page.getByText('1 of 18 sets logged')).toBeVisible();

  await page.reload();

  const squatAfter = exercise(page, 'Smith Machine Box Squat');
  await expect(squatAfter.getByLabel('Set 1 weight in pounds')).toHaveValue('95');
  await expect(squatAfter.getByLabel('Set 1 reps')).toHaveValue('12');
  await expect(squatAfter.getByLabel('Set 1 done')).toBeChecked();
});

test('add set and remove last set', async ({ page }) => {
  const legExt = exercise(page, 'Leg Extension');
  await expect(legExt.getByLabel(/^Set \d+ reps$/)).toHaveCount(3);

  await legExt.getByRole('button', { name: 'Add set' }).click();
  await expect(legExt.getByLabel(/^Set \d+ reps$/)).toHaveCount(4);

  await legExt.getByRole('button', { name: 'Remove last' }).click();
  await expect(legExt.getByLabel(/^Set \d+ reps$/)).toHaveCount(3);
});

test('notes are saved', async ({ page }) => {
  await page.getByLabel('Notes').fill('Felt strong today');
  await page.getByLabel('Notes').blur();
  await page.reload();
  await expect(page.getByLabel('Notes')).toHaveValue('Felt strong today');
});

test('finishing a workout marks the day as done', async ({ page }) => {
  await page.getByRole('button', { name: 'Finish workout' }).click();

  await expect(
    page.getByRole('group', { name: 'Day of week' }).getByRole('button', { name: /^Tuesday.*training done/ })
  ).toBeVisible();
});
