/**
 * LESSON 2 — Clicking around and checking state changes.
 *
 * - `test.beforeEach` runs before every test in the file.
 * - `test.describe` groups related tests.
 * - Assert on accessible state such as `aria-pressed` rather than on CSS classes.
 */
import { test, expect } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Today page', () => {
  test('picking a day shows that day\'s workout', async ({ page }) => {
    const days = page.getByRole('group', { name: 'Day of week' });

    await days.getByRole('button', { name: /^Monday/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Monday, March 9');
    await expect(page.getByRole('heading', { name: 'Upper Body Push' })).toBeVisible();
    await expect(days.getByRole('button', { name: /^Monday/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('next / previous week buttons move the week', async ({ page }) => {
    await expect(page.getByText('Week of Mar 8')).toBeVisible();

    await page.getByRole('button', { name: 'Next week' }).click();
    await expect(page.getByText('Week of Mar 15')).toBeVisible();
    await expect(page.getByText('Upcoming week')).toBeVisible();

    await page.getByRole('button', { name: 'This week', exact: true }).click();
    await expect(page.getByText('Week of Mar 8')).toBeVisible();
  });

  test('switching to a mobility week', async ({ page }) => {
    const weekType = page.getByRole('group', { name: 'Week type' });
    await weekType.getByRole('button', { name: 'Mobility week' }).click();
    await expect(weekType.getByRole('button', { name: 'Mobility week' })).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('Tabs', () => {
  test('Month tab shows the calendar grid', async ({ page }) => {
    await page.getByRole('button', { name: 'Month', exact: true }).click();
    await expect(page.getByRole('table', { name: 'Month overview' })).toBeVisible();
    await expect(page.getByText('Workouts done')).toBeVisible();
  });

  test('clicking a day in the Month grid opens it on Today', async ({ page }) => {
    await page.getByRole('button', { name: 'Month', exact: true }).click();
    await page.getByRole('button', { name: 'Week 2 Wednesday' }).click();

    await expect(page.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { name: 'Upper Body Pull' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Week 2' })).toHaveAttribute('aria-pressed', 'true');
  });
});
