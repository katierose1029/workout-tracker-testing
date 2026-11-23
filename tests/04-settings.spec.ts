/**
 * LESSON 4 — Downloads, file uploads, dialogs, and reading app storage.
 *
 * - `page.waitForEvent('download')` captures a file the app saves.
 * - `setInputFiles()` uploads a file into an <input type="file">, even a hidden one.
 * - `page.evaluate()` runs code inside the browser, handy for peeking at localStorage.
 */
import { test, expect } from './fixtures';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
});

test('works on this device when not signed in', async ({ page }) => {
  await expect(page.getByText('Saved on this device only')).toBeVisible();
});

test('dark theme is applied and remembered', async ({ page }) => {
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  const stored = await page.evaluate(() => localStorage.getItem('ppw1:theme'));
  expect(stored).toBe('dark');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('JSON backup can be downloaded and restored', async ({ page }) => {
  // Log something first so the backup has data in it.
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await page.getByLabel('Notes').fill('backup me');
  await page.getByLabel('Notes').blur();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();

  // 1. Download the backup.
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download backup (JSON)' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('workout-backup-2026-03-10.json');

  const backupPath = await download.path();
  const backup = JSON.parse(await readFile(backupPath, 'utf8'));
  expect(backup.app).toBe('workout-tracker');
  expect(JSON.stringify(backup.logs)).toContain('backup me');

  // 2. Wipe the month, then restore from the file we just downloaded.
  await page.getByRole('button', { name: 'Clear this month’s logs' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Clear logs' }).click();
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(page.getByLabel('Notes')).toHaveValue('');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();

  await page.getByLabel('Restore from backup').setInputFiles(backupPath);
  const dialog = page.getByRole('dialog', { name: 'Restore this backup?' });
  await dialog.getByRole('button', { name: 'Restore' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Backup restored' })).toBeVisible();

  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(page.getByLabel('Notes')).toHaveValue('backup me');
});

test('restoring a file that is not a backup shows an error', async ({ page }) => {
  await page.getByLabel('Restore from backup').setInputFiles({
    name: 'not-a-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"hello": "world"}'),
  });
  await expect(page.getByText('That file isn’t a workout backup')).toBeVisible();
});

test('cancel in a confirm dialog keeps the data', async ({ page }) => {
  await page.getByRole('button', { name: 'Clear this month’s logs' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toBeHidden();
});
